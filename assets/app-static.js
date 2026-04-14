(function () {
    var restaurantName = document.getElementById("restaurant-name");
    var whatsappButton = document.getElementById("whatsapp-button");
    var menuStatus = document.getElementById("menu-status");
    var orderFeedback = document.getElementById("order-feedback");
    var menuContainer = document.getElementById("menu-container");
    var cartItems = document.getElementById("cart-items");
    var cartTotal = document.getElementById("cart-total");
    var orderForm = document.getElementById("order-form");
    var customerNameInput = document.getElementById("customer_name");
    var tableNumberInput = document.getElementById("table_number");
    var orderNotesInput = document.getElementById("order_notes");
    var submitOrderButton = document.getElementById("submit-order-button");
    var orderLookupForm = document.getElementById("order-lookup-form");
    var orderLookupIdInput = document.getElementById("order_lookup_id");
    var customerOrderView = document.getElementById("customer-order-view");

    var currentMenu = null;
    var cart = [];

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
        var normalized = normalizeWhatsapp(number);
        return normalized ? "https://wa.me/" + normalized : "#";
    }

    function showMessage(element, message, type) {
        element.textContent = message;
        element.classList.remove("hidden", "error", "success");
        if (type) {
            element.classList.add(type);
        }
    }

    function clearMessage(element) {
        element.textContent = "";
        element.classList.add("hidden");
        element.classList.remove("error", "success");
    }

    function getAllItems(menu) {
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

    function getItemById(itemId) {
        return getAllItems(currentMenu || {}).find(function (item) {
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
            return;
        }

        cartItems.innerHTML = cart.map(function (item) {
            return [
                '<article class="cart-item" data-item-id="' + item.id + '">',
                '<div class="cart-item-info">',
                "<strong>" + item.name + "</strong>",
                "<span>" + formatPrice(item.price) + " cada</span>",
                "</div>",
                '<div class="cart-item-actions">',
                '<div class="quantity-control">',
                '<button type="button" class="quantity-button" data-action="decrease" data-item-id="' + item.id + '">-</button>',
                "<span>" + item.quantity + "</span>",
                '<button type="button" class="quantity-button" data-action="increase" data-item-id="' + item.id + '">+</button>',
                "</div>",
                '<button type="button" class="link-button remove-cart-item" data-item-id="' + item.id + '">Remover</button>',
                "</div>",
                "</article>"
            ].join("");
        }).join("");

        cartTotal.textContent = formatPrice(getCartTotal());
        submitOrderButton.disabled = false;
    }

    function addToCart(itemId) {
        var item = getItemById(itemId);
        if (!item) {
            showMessage(orderFeedback, "Esse item nao esta mais disponivel.", "error");
            return;
        }

        var existingItem = cart.find(function (entry) {
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
            '<span class="order-badge badge-' + order.status + '">' + order.status_label + "</span>",
            "<strong>Pedido #" + order.id + "</strong>",
            "</div>",
            '<div class="order-card-meta">',
            "<span>Cliente: " + order.customer_name + "</span>",
            "<span>Mesa " + order.table_number + "</span>",
            "<span>" + new Date(order.created_at).toLocaleString("pt-BR") + "</span>",
            "</div>",
            '<ul class="order-items-list">' + order.items.map(function (item) {
                return "<li><strong>" + item.quantity + "x</strong> " + item.name + " <span>" + formatPrice(item.subtotal) + "</span></li>";
            }).join("") + "</ul>",
            order.notes ? '<p class="order-note">Observacoes: ' + order.notes + "</p>" : "",
            '<div class="order-total">Total: <strong>' + formatPrice(order.total) + "</strong></div>",
            "</div>"
        ].join("");
    }

    function createItemCard(item) {
        var imageHtml = item.image
            ? '<img class="item-image" src="' + item.image + '" alt="' + item.name + '">'
            : '<div class="item-image"></div>';

        return [
            '<article class="menu-item-card">',
            imageHtml,
            '<div class="item-body">',
            '<div class="item-title-row">',
            '<h3 class="item-title">' + item.name + "</h3>",
            '<span class="item-price">' + formatPrice(item.price) + "</span>",
            "</div>",
            '<p class="item-description">' + (item.description || "") + "</p>",
            '<div class="item-actions">',
            '<span class="item-category-tag">' + item.category + "</span>",
            '<button type="button" class="button button-primary add-to-cart-button" data-item-id="' + item.id + '">Adicionar</button>',
            "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function renderMenu(menu) {
        restaurantName.textContent = menu.restaurant_name || "Cardapio Digital";
        whatsappButton.href = buildWhatsappLink(menu.whatsapp);
        whatsappButton.textContent = menu.whatsapp ? "Suporte pelo WhatsApp" : "WhatsApp nao informado";

        var categories = Array.isArray(menu.categories) ? menu.categories : [];
        if (!categories.length) {
            showMessage(menuStatus, "Nenhuma categoria cadastrada no momento.", "error");
            menuContainer.innerHTML = "";
            return;
        }

        menuContainer.innerHTML = categories.map(function (category) {
            var items = Array.isArray(category.items) ? category.items : [];
            return [
                '<section class="category-section">',
                '<div class="category-header">',
                '<h2 class="category-title">' + category.name + "</h2>",
                '<p class="category-description">' + items.length + " item(ns)</p>",
                "</div>",
                items.length
                    ? '<div class="items-grid">' + items.map(function (item) {
                        return createItemCard(Object.assign({}, item, { category: category.name }));
                    }).join("") + "</div>"
                    : '<div class="empty-state">Nenhum item nesta categoria.</div>',
                "</section>"
            ].join("");
        }).join("");
    }

    function createOrderPayload() {
        return {
            customer_name: customerNameInput.value.trim(),
            table_number: tableNumberInput.value.trim(),
            notes: orderNotesInput.value.trim(),
            items: cart.map(function (item) {
                return {
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    unit_price: Number(item.price),
                    subtotal: Number(item.price) * Number(item.quantity)
                };
            })
        };
    }

    async function loadMenu() {
        try {
            currentMenu = await window.cardapioStore.getMenu();
            renderMenu(currentMenu);
            renderCart();
            clearMessage(menuStatus);
        } catch (error) {
            showMessage(menuStatus, error.message || "Erro ao carregar o cardapio.", "error");
            menuContainer.innerHTML = "";
        }
    }

    async function submitOrder(event) {
        event.preventDefault();
        clearMessage(orderFeedback);

        if (!cart.length) {
            showMessage(orderFeedback, "Adicione itens ao carrinho antes de enviar.", "error");
            return;
        }

        if (!customerNameInput.value.trim() || !tableNumberInput.value.trim()) {
            showMessage(orderFeedback, "Informe nome e mesa para enviar o pedido.", "error");
            return;
        }

        try {
            var order = await window.cardapioStore.createOrder(createOrderPayload());
            cart = [];
            orderForm.reset();
            renderCart();
            orderLookupIdInput.value = order.id;
            renderCustomerOrder(order);
            showMessage(orderFeedback, "Pedido #" + order.id + " enviado com sucesso.", "success");
        } catch (error) {
            showMessage(orderFeedback, error.message || "Nao foi possivel registrar o pedido.", "error");
        }
    }

    async function lookupOrder(event) {
        event.preventDefault();
        clearMessage(orderFeedback);

        var orderId = orderLookupIdInput.value.trim();
        if (!orderId) {
            showMessage(orderFeedback, "Informe o numero do pedido para visualizar.", "error");
            return;
        }

        try {
            var order = await window.cardapioStore.findOrderById(orderId);
            if (!order) {
                customerOrderView.classList.add("hidden");
                customerOrderView.innerHTML = "";
                showMessage(orderFeedback, "Pedido nao encontrado.", "error");
                return;
            }

            renderCustomerOrder(order);
            showMessage(orderFeedback, "Pedido carregado com sucesso.", "success");
        } catch (error) {
            showMessage(orderFeedback, error.message || "Nao foi possivel consultar o pedido.", "error");
        }
    }

    menuContainer.addEventListener("click", function (event) {
        var addButton = event.target.closest(".add-to-cart-button");
        if (addButton) {
            addToCart(addButton.getAttribute("data-item-id"));
        }
    });

    cartItems.addEventListener("click", function (event) {
        var quantityButton = event.target.closest(".quantity-button");
        var removeButton = event.target.closest(".remove-cart-item");

        if (quantityButton) {
            var action = quantityButton.getAttribute("data-action");
            var itemId = quantityButton.getAttribute("data-item-id");
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
