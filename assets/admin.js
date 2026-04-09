(function () {
    const settingsForm = document.getElementById("settings-form");
    const itemForm = document.getElementById("item-form");
    const itemFormTitle = document.getElementById("item-form-title");
    const saveItemButton = document.getElementById("save-item-button");
    const cancelEditButton = document.getElementById("cancel-edit-button");
    const feedback = document.getElementById("admin-feedback");
    const itemsList = document.getElementById("items-list");

    const restaurantNameInput = document.getElementById("restaurant_name");
    const whatsappInput = document.getElementById("whatsapp");
    const itemIdInput = document.getElementById("item_id");
    const categoryInput = document.getElementById("category");
    const nameInput = document.getElementById("name");
    const descriptionInput = document.getElementById("description");
    const priceInput = document.getElementById("price");
    const imageInput = document.getElementById("image");

    let currentMenu = null;

    function showFeedback(message, type) {
        feedback.textContent = message;
        feedback.classList.remove("hidden", "error", "success");
        if (type) {
            feedback.classList.add(type);
        }
    }

    function clearFeedback() {
        feedback.textContent = "";
        feedback.classList.add("hidden");
        feedback.classList.remove("error", "success");
    }

    function formatPrice(value) {
        return Number(value || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function flattenItems(menu) {
        const categories = Array.isArray(menu.categories) ? menu.categories : [];
        return categories.flatMap(function (category) {
            const items = Array.isArray(category.items) ? category.items : [];
            return items.map(function (item) {
                return {
                    id: item.id,
                    category: category.name,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    image: item.image
                };
            });
        });
    }

    function resetItemForm() {
        itemForm.reset();
        itemIdInput.value = "";
        itemFormTitle.textContent = "Adicionar item";
        saveItemButton.textContent = "Adicionar item";
        cancelEditButton.classList.add("hidden");
    }

    function fillForms(menu) {
        restaurantNameInput.value = menu.restaurant_name || "";
        whatsappInput.value = menu.whatsapp || "";
        renderItems(menu);
    }

    function renderItems(menu) {
        const items = flattenItems(menu);

        if (!items.length) {
            itemsList.innerHTML = '<div class="empty-state">Nenhum item cadastrado ainda.</div>';
            return;
        }

        itemsList.innerHTML = items.map(function (item) {
            const thumb = item.image
                ? '<img class="admin-thumb" src="' + item.image + '" alt="' + item.name + '">'
                : '<div class="admin-thumb"></div>';

            return [
                '<article class="admin-item-card" data-item-id="' + item.id + '">',
                thumb,
                '<div class="admin-item-content">',
                '<h3>' + item.name + "</h3>",
                '<p>' + (item.description || "") + "</p>",
                '<div class="admin-meta">',
                "<span>Categoria: " + item.category + "</span>",
                "<span>Preço: " + formatPrice(item.price) + "</span>",
                "<span>ID: " + item.id + "</span>",
                "</div>",
                "</div>",
                '<div class="admin-item-actions">',
                '<button type="button" class="button button-secondary edit-item-button" data-item-id="' + item.id + '">Editar</button>',
                '<button type="button" class="button button-danger delete-item-button" data-item-id="' + item.id + '">Excluir</button>',
                "</div>",
                "</article>"
            ].join("");
        }).join("");
    }

    async function fetchMenu(showLoadMessage) {
        if (showLoadMessage) {
            showFeedback("Carregando dados do cardápio...", "");
        }

        try {
            const response = await fetch("/api/menu");
            if (!response.ok) {
                throw new Error("Não foi possível carregar os dados.");
            }

            const menu = await response.json();
            currentMenu = menu;
            fillForms(menu);
            if (showLoadMessage) {
                clearFeedback();
            }
        } catch (error) {
            showFeedback(error.message || "Erro ao carregar dados.", "error");
        }
    }

    async function saveSettings(event) {
        event.preventDefault();
        clearFeedback();

        const payload = {
            restaurant_name: restaurantNameInput.value.trim(),
            whatsapp: whatsappInput.value.trim()
        };

        try {
            const response = await fetch("/api/menu/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Não foi possível salvar as configurações.");
            }

            showFeedback(result.message || "Configurações salvas com sucesso.", "success");
            await fetchMenu(false);
        } catch (error) {
            showFeedback(error.message || "Erro ao salvar configurações.", "error");
        }
    }

    async function saveItem(event) {
        event.preventDefault();
        clearFeedback();

        const itemId = itemIdInput.value.trim();
        const payload = {
            category: categoryInput.value.trim(),
            name: nameInput.value.trim(),
            description: descriptionInput.value.trim(),
            price: Number(priceInput.value),
            image: imageInput.value.trim()
        };

        const method = itemId ? "PUT" : "POST";
        const url = itemId ? "/api/menu/item/" + itemId : "/api/menu/item";

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Não foi possível salvar o item.");
            }

            showFeedback(result.message || "Item salvo com sucesso.", "success");
            resetItemForm();
            await fetchMenu(false);
        } catch (error) {
            showFeedback(error.message || "Erro ao salvar item.", "error");
        }
    }

    function startEdit(itemId) {
        if (!currentMenu) {
            return;
        }

        const item = flattenItems(currentMenu).find(function (entry) {
            return String(entry.id) === String(itemId);
        });

        if (!item) {
            showFeedback("Item não encontrado.", "error");
            return;
        }

        itemIdInput.value = item.id;
        categoryInput.value = item.category;
        nameInput.value = item.name;
        descriptionInput.value = item.description || "";
        priceInput.value = item.price;
        imageInput.value = item.image || "";

        itemFormTitle.textContent = "Editar item";
        saveItemButton.textContent = "Salvar alterações";
        cancelEditButton.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function deleteItem(itemId) {
        const confirmed = window.confirm("Deseja realmente excluir este item?");
        if (!confirmed) {
            return;
        }

        clearFeedback();

        try {
            const response = await fetch("/api/menu/item/" + itemId, {
                method: "DELETE"
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Não foi possível excluir o item.");
            }

            showFeedback(result.message || "Item excluído com sucesso.", "success");
            resetItemForm();
            await fetchMenu(false);
        } catch (error) {
            showFeedback(error.message || "Erro ao excluir item.", "error");
        }
    }

    itemsList.addEventListener("click", function (event) {
        const editButton = event.target.closest(".edit-item-button");
        const deleteButton = event.target.closest(".delete-item-button");

        if (editButton) {
            startEdit(editButton.getAttribute("data-item-id"));
        }

        if (deleteButton) {
            deleteItem(deleteButton.getAttribute("data-item-id"));
        }
    });

    cancelEditButton.addEventListener("click", function () {
        resetItemForm();
        clearFeedback();
    });

    settingsForm.addEventListener("submit", saveSettings);
    itemForm.addEventListener("submit", saveItem);

    fetchMenu(true);
})();
