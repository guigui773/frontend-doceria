(function () {
    const restaurantName = document.getElementById("restaurant-name");
    const whatsappButton = document.getElementById("whatsapp-button");
    const menuStatus = document.getElementById("menu-status");
    const orderFeedback = document.getElementById("order-feedback");
    const menuContainer = document.getElementById("menu-container");
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const orderForm = document.getElementById("order-form");
    const customerNameInput = document.getElementById("customer_name");
    const tableNumberInput = document.getElementById("table_number");
    const orderNotesInput = document.getElementById("order_notes");
    const submitOrderButton = document.getElementById("submit-order-button");
    const orderLookupForm = document.getElementById("order-lookup-form");
    const orderLookupIdInput = document.getElementById("order_lookup_id");
    const customerOrderView = document.getElementById("customer-order-view");

    let currentMenu = null;
    let cart = [];

    function formatPrice(value) {
        return Number(value || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function normalizeWhatsapp(value) {
        return String(value || "").replace(/\D/g, "");
    }

    function buildWhatsappLink(number) {
        const normalized = normalizeWhatsapp(number);
        return normalized ? "https://wa.me/" + normalized : "#";
    }

    function showMessage(element, message, type) {
        element.textContent = message;
        element.classList.remove("hidden", "error", "success");
        if (type) {
            element.classList.add(type);
        } else {
            element.classList.remove("error", "success");
        }
    }

    function clearMessage(element) {
        element.textContent = "";
        element.classList.add("hidden");
        element.classList.remove("error", "success");
    }

    function getAllItems(menu) {
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

    function getItemById(itemId) {
        if (!currentMenu) {
            return null;
        }

        return getAllItems(currentMenu).find(function (item) {
            return String(item.id) === String(itemId);
        }) || null;
    }

    function getCartTotal() {
        return cart.reduce(function (total, item) {
            return total + (Number(item.price) * Number(item.quantity));
        }, 0);
    }

    function renderCart() {
        if (!cart.length) {
            cartItems.innerHTML = '<div class="empty-state">Nenhum item no pedido ainda.</div>';
            cartTotal.textContent = formatPrice(0);
            submitOrderButton.disabled = true;
            submitOrderButton.classList.add("button-secondary");
            submitOrderButton.classList.remove("button-primary");
            return;
        }

        cartItems.innerHTML = cart.map(function (item) {
            return [
                '<article class="cart-item" data-item-id="' + item.id + '">',
                '<div class="cart-item-info">',
                '<strong>' + item.name + '</strong>',
                '<span>' + formatPrice(item.price) + ' cada</span>',
                '</div>',
                '<div class="cart-item-actions">',
                '<div class="quantity-control">',
                '<button type="button" class="quantity-button" data-action="decrease" data-item-id="' + item.id + '">-</button>',
                '<span>' + item.quantity + '</span>',
                '<button type="button" class="quantity-button" data-action="increase" data-item-id="' + item.id + '">+</button>',
                '</div>',
                '<button type="button" class="link-button remove-cart-item" data-item-id="' + item.id + '">Remover</button>',
                '</div>',
                '</article>'
            ].join("");
        }).join("");

        cartTotal.textContent = formatPrice(getCartTotal());
        submitOrderButton.disabled = false;
        submitOrderButton.classList.remove("button-secondary");
        submitOrderButton.classList.add("button-primary");
    }

    function addToCart(itemId) {
        const item = getItemById(itemId);
        if (!item) {
            showMessage(orderFeedback, "Esse item não está mais disponível.", "error");
            return;
        }

        const existingItem = cart.find(function (entry) {
            return String(entry.id) === String(item.id);
        });

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: Number(item.price),
                quantity: 1
            });
        }

        clearMessage(orderFeedback);
        renderCart();
    }

    function updateCartQuantity(itemId, delta) {
        cart = cart.map(function (item) {
            if (String(item.id) !== String(itemId)) {
                return item;
            }

            return Object.assign({}, item, {
                quantity: item.quantity + delta
            });
        }).filter(function (item) {
            return item.quantity > 0;
        });

        renderCart();
    }

    function removeFromCart(itemId) {
        cart = cart.filter(function (item) {
            return String(item.id) !== String(itemId);
        });
        renderCart();
    }

    function renderCustomerOrder(order) {
        customerOrderView.classList.remove("hidden");
        customerOrderView.innerHTML = [
            '<div class="customer-order-card">',
            '<div class="order-card-top">',
            '<span class="order-badge badge-' + order.status + '">' + order.status_label + '</span>',
            '<strong>Pedido #' + order.id + '</strong>',
            '</div>',
            '<div class="order-card-meta">',
            '<span>Cliente: ' + order.customer_name + '</span>',
            '<span>Mesa ' + order.table_number + '</span>',
            '<span>' + new Date(order.created_at).toLocaleString("pt-BR") + '</span>',
            '</div>',
            '<ul class="order-items-list">' + order.items.map(function (item) {
                return '<li><strong>' + item.quantity + 'x</strong> ' + item.name + ' <span>' + formatPrice(item.subtotal) + '</span></li>';
            }).join("") + '</ul>',
            order.notes ? '<p class="order-note">Observações: ' + order.notes + '</p>' : '',
            '<div class="order-total">Total: <strong>' + formatPrice(order.total) + '</strong></div>',
            '</div>'
        ].join("");
    }

    function createItemCard(item) {
        const imageHtml = item.image
            ? '<img class="item-image" src="' + item.image + '" alt="' + item.name + '">'
            : '<div class="item-image"></div>';

        return [
            '<article class="menu-item-card">',
            imageHtml,
            '<div class="item-body">',
            '<div class="item-title-row">',
            '<h3 class="item-title">' + item.name + '</h3>',
            '<span class="item-price">' + formatPrice(item.price) + '</span>',
            '</div>',
            '<p class="item-description">' + (item.description || "") + '</p>',
            '<div class="item-actions">',
            '<span class="item-category-tag">' + item.category + '</span>',
            '<button type="button" class="button button-primary add-to-cart-button" data-item-id="' + item.id + '">Adicionar</button>',
            '</div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function renderMenu(menu) {
        restaurantName.textContent = menu.restaurant_name || "Cardápio Digital";

        const whatsappLink = buildWhatsappLink(menu.whatsapp);
        whatsappButton.href = whatsappLink;
        whatsappButton.textContent = menu.whatsapp
            ? "Suporte pelo WhatsApp"
            : "WhatsApp não informado";

        if (!menu.whatsapp) {
            whatsappButton.classList.add("button-secondary");
            whatsappButton.classList.remove("button-primary");
            whatsappButton.setAttribute("aria-disabled", "true");
        }

        const categories = Array.isArray(menu.categories) ? menu.categories : [];

        if (!categories.length) {
            menuStatus.textContent = "Nenhuma categoria cadastrada no momento.";
            menuStatus.classList.remove("hidden");
            menuContainer.innerHTML = "";
            return;
        }

        menuStatus.classList.add("hidden");

        menuContainer.innerHTML = categories.map(function (category) {
            const items = Array.isArray(category.items) ? category.items : [];
            return [
                '<section class="category-section">',
                '<div class="category-header">',
                '<h2 class="category-title">' + category.name + '</h2>',
                '<p class="category-description">' + items.length + ' item(ns)</p>',
                '</div>',
                items.length
                    ? '<div class="items-grid">' + items.map(function (item) {
                        return createItemCard(Object.assign({}, item, { category: category.name }));
                    }).join("") + '</div>'
                    : '<div class="empty-state">Nenhum item nesta categoria.</div>',
                '</section>'
            ].join("");
        }).join("");
    }

    async function loadMenu() {
        showMessage(menuStatus, "Carregando cardápio...", "");

        try {
            const response = await fetch("/api/menu");
            if (!response.ok) {
                throw new Error("Não foi possível carregar o cardápio.");
            }

            currentMenu = await response.json();
            renderMenu(currentMenu);
            clearMessage(menuStatus);
            renderCart();
        } catch (error) {
            showMessage(menuStatus, error.message || "Erro ao carregar o cardápio.", "error");
            menuContainer.innerHTML = "";
        }
    }

    async function fetchOrderById(orderId) {
        const response = await fetch("/api/orders/" + orderId);
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || "Não foi possível localizar o pedido.");
        }
        return result.order;
    }

    async function submitOrder(event) {
        event.preventDefault();
        clearMessage(orderFeedback);

        if (!cart.length) {
            showMessage(orderFeedback, "Adicione itens ao carrinho antes de enviar.", "error");
            return;
        }

        if (!customerNameInput.value.trim()) {
            showMessage(orderFeedback, "Informe o nome do cliente para enviar o pedido.", "error");
            customerNameInput.focus();
            return;
        }

        const payload = {
            customer_name: customerNameInput.value.trim(),
            table_number: tableNumberInput.value.trim(),
            notes: orderNotesInput.value.trim(),
            items: cart.map(function (item) {
                return {
                    item_id: item.id,
                    quantity: item.quantity
                };
            })
        };

        try {
            submitOrderButton.disabled = true;
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Não foi possível enviar o pedido.");
            }

            showMessage(orderFeedback, result.message + " Agora você pode acompanhar abaixo pelo número do pedido.", "success");
            cart = [];
            orderForm.reset();
            renderCart();
            orderLookupIdInput.value = result.order.id;
            renderCustomerOrder(result.order);
        } catch (error) {
            showMessage(orderFeedback, error.message || "Erro ao enviar pedido.", "error");
        } finally {
            submitOrderButton.disabled = false;
        }
    }

    async function lookupOrder(event) {
        event.preventDefault();
        clearMessage(orderFeedback);

        const orderId = orderLookupIdInput.value.trim();
        if (!orderId) {
            showMessage(orderFeedback, "Informe o número do pedido para visualizar.", "error");
            return;
        }

        try {
            const order = await fetchOrderById(orderId);
            renderCustomerOrder(order);
            showMessage(orderFeedback, "Pedido carregado com sucesso.", "success");
        } catch (error) {
            customerOrderView.classList.add("hidden");
            customerOrderView.innerHTML = "";
            showMessage(orderFeedback, error.message || "Erro ao consultar pedido.", "error");
        }
    }

    menuContainer.addEventListener("click", function (event) {
        const addButton = event.target.closest(".add-to-cart-button");
        if (addButton) {
            addToCart(addButton.getAttribute("data-item-id"));
        }
    });

    cartItems.addEventListener("click", function (event) {
        const quantityButton = event.target.closest(".quantity-button");
        const removeButton = event.target.closest(".remove-cart-item");

        if (quantityButton) {
            const action = quantityButton.getAttribute("data-action");
            const itemId = quantityButton.getAttribute("data-item-id");
            updateCartQuantity(itemId, action === "increase" ? 1 : -1);
        }

        if (removeButton) {
            removeFromCart(removeButton.getAttribute("data-item-id"));
        }
    });

    orderForm.addEventListener("submit", submitOrder);
    orderLookupForm.addEventListener("submit", lookupOrder);

    loadMenu();
})();
