(function () {
    var settingsForm = document.getElementById("settings-form");
    var itemForm = document.getElementById("item-form");
    var itemFormTitle = document.getElementById("item-form-title");
    var saveItemButton = document.getElementById("save-item-button");
    var cancelEditButton = document.getElementById("cancel-edit-button");
    var feedback = document.getElementById("admin-feedback");
    var itemsList = document.getElementById("items-list");
    var logoutLink = document.getElementById("logout-link");

    var restaurantNameInput = document.getElementById("restaurant_name");
    var whatsappInput = document.getElementById("whatsapp");
    var itemIdInput = document.getElementById("item_id");
    var categoryInput = document.getElementById("category");
    var nameInput = document.getElementById("name");
    var descriptionInput = document.getElementById("description");
    var priceInput = document.getElementById("price");
    var imageInput = document.getElementById("image");

    var currentMenu = null;

    function ensureAuthenticated() {
        var session = window.cardapioStore.getSession();
        if (!session.authenticated) {
            window.location.href = "./login.html";
        }
    }

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
        var categories = Array.isArray(menu.categories) ? menu.categories : [];
        return categories.flatMap(function (category) {
            var items = Array.isArray(category.items) ? category.items : [];
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

    function getNextItemId() {
        return flattenItems(currentMenu).reduce(function (maxId, item) {
            return Math.max(maxId, Number(item.id) || 0);
        }, 0) + 1;
    }

    function renderItems(menu) {
        var items = flattenItems(menu);
        if (!items.length) {
            itemsList.innerHTML = '<div class="empty-state">Nenhum item cadastrado ainda.</div>';
            return;
        }

        itemsList.innerHTML = items.map(function (item) {
            var thumb = item.image
                ? '<img class="admin-thumb" src="' + item.image + '" alt="' + item.name + '">'
                : '<div class="admin-thumb"></div>';

            return [
                '<article class="admin-item-card" data-item-id="' + item.id + '">',
                thumb,
                '<div class="admin-item-content">',
                "<h3>" + item.name + "</h3>",
                "<p>" + (item.description || "") + "</p>",
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

    function fillForms(menu) {
        restaurantNameInput.value = menu.restaurant_name || "";
        whatsappInput.value = menu.whatsapp || "";
        renderItems(menu);
    }

    function saveMenu() {
        window.cardapioStore.saveMenu(currentMenu);
    }

    function saveSettings(event) {
        event.preventDefault();
        clearFeedback();
        currentMenu.restaurant_name = restaurantNameInput.value.trim();
        currentMenu.whatsapp = whatsappInput.value.trim();
        saveMenu();
        showFeedback("Configurações salvas no navegador com sucesso.", "success");
    }

    function saveItem(event) {
        event.preventDefault();
        clearFeedback();

        var itemId = Number(itemIdInput.value.trim() || getNextItemId());
        var itemPayload = {
            id: itemId,
            category: categoryInput.value.trim(),
            name: nameInput.value.trim(),
            description: descriptionInput.value.trim(),
            price: Number(priceInput.value),
            image: imageInput.value.trim()
        };

        currentMenu.categories = currentMenu.categories.map(function (category) {
            return {
                name: category.name,
                items: category.items.filter(function (item) {
                    return String(item.id) !== String(itemId);
                })
            };
        }).filter(function (category) {
            return category.items.length > 0;
        });

        var targetCategory = currentMenu.categories.find(function (category) {
            return category.name === itemPayload.category;
        });

        if (!targetCategory) {
            targetCategory = {
                name: itemPayload.category,
                items: []
            };
            currentMenu.categories.push(targetCategory);
        }

        targetCategory.items.push(itemPayload);
        saveMenu();
        fillForms(currentMenu);
        resetItemForm();
        showFeedback("Item salvo no JSON local do navegador.", "success");
    }

    function startEdit(itemId) {
        var item = flattenItems(currentMenu).find(function (entry) {
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

    function deleteItem(itemId) {
        if (!window.confirm("Deseja realmente excluir este item?")) {
            return;
        }

        currentMenu.categories = currentMenu.categories.map(function (category) {
            return {
                name: category.name,
                items: category.items.filter(function (item) {
                    return String(item.id) !== String(itemId);
                })
            };
        }).filter(function (category) {
            return category.items.length > 0;
        });

        saveMenu();
        fillForms(currentMenu);
        resetItemForm();
        showFeedback("Item removido com sucesso.", "success");
    }

    itemsList.addEventListener("click", function (event) {
        var editButton = event.target.closest(".edit-item-button");
        var deleteButton = event.target.closest(".delete-item-button");

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

    logoutLink.addEventListener("click", function () {
        window.cardapioStore.clearSession();
    });

    settingsForm.addEventListener("submit", saveSettings);
    itemForm.addEventListener("submit", saveItem);

    ensureAuthenticated();
    window.cardapioStore.getMenu().then(function (menu) {
        currentMenu = menu;
        fillForms(menu);
        showFeedback("Painel carregado em modo estático.", "success");
    });
})();
