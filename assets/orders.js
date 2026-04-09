(function () {
    const feedback = document.getElementById("orders-feedback");
    const columns = {
        novo: document.getElementById("orders-novo"),
        em_preparo: document.getElementById("orders-em_preparo"),
        pronto: document.getElementById("orders-pronto"),
        finalizados: document.getElementById("orders-finalizados")
    };

    const statusActions = {
        novo: [
            { value: "em_preparo", label: "Iniciar preparo" },
            { value: "cancelado", label: "Cancelar" }
        ],
        em_preparo: [
            { value: "pronto", label: "Marcar pronto" },
            { value: "cancelado", label: "Cancelar" }
        ],
        pronto: [
            { value: "entregue", label: "Marcar entregue" },
            { value: "cancelado", label: "Cancelar" }
        ],
        entregue: [],
        cancelado: []
    };

    function formatPrice(value) {
        return Number(value || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatDate(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value);
        return date.toLocaleString("pt-BR");
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

    function getTargetColumn(order) {
        if (order.status === "entregue" || order.status === "cancelado") {
            return columns.finalizados;
        }
        return columns[order.status] || columns.novo;
    }

    function createActionButtons(order) {
        const actions = statusActions[order.status] || [];
        if (!actions.length) {
            return '<div class="order-card-actions"><span class="muted-text">Sem ações pendentes</span></div>';
        }

        return '<div class="order-card-actions">' + actions.map(function (action) {
            const buttonClass = action.value === "cancelado" ? "button button-danger" : "button button-secondary";
            return '<button type="button" class="' + buttonClass + ' update-order-status" data-order-id="' + order.id + '" data-status="' + action.value + '">' + action.label + '</button>';
        }).join("") + '</div>';
    }

    function createOrderCard(order) {
        const itemsHtml = order.items.map(function (item) {
            return '<li><strong>' + item.quantity + 'x</strong> ' + item.name + ' <span>' + formatPrice(item.subtotal) + '</span></li>';
        }).join("");

        return [
            '<article class="order-card" data-order-id="' + order.id + '">',
            '<div class="order-card-top">',
            '<span class="order-badge badge-' + order.status + '">' + order.status_label + '</span>',
            '<strong>Pedido #' + order.id + '</strong>',
            '</div>',
            '<div class="order-card-meta">',
            '<span>Mesa ' + order.table_number + '</span>',
            '<span>' + formatDate(order.created_at) + '</span>',
            order.customer_name ? '<span>Cliente: ' + order.customer_name + '</span>' : '',
            '</div>',
            '<ul class="order-items-list">' + itemsHtml + '</ul>',
            order.notes ? '<p class="order-note">Observações: ' + order.notes + '</p>' : '',
            '<div class="order-total">Total: <strong>' + formatPrice(order.total) + '</strong></div>',
            createActionButtons(order),
            '</article>'
        ].join("");
    }

    function renderOrders(orders) {
        Object.keys(columns).forEach(function (key) {
            columns[key].innerHTML = '<div class="empty-state">Nenhum pedido nesta etapa.</div>';
        });

        if (!orders.length) {
            return;
        }

        Object.keys(columns).forEach(function (key) {
            columns[key].innerHTML = "";
        });

        orders.forEach(function (order) {
            getTargetColumn(order).insertAdjacentHTML("beforeend", createOrderCard(order));
        });
    }

    async function fetchOrders(showLoadingMessage) {
        if (showLoadingMessage) {
            showFeedback("Carregando pedidos...", "");
        }

        try {
            const response = await fetch("/api/orders");
            if (!response.ok) {
                throw new Error("Não foi possível carregar os pedidos.");
            }

            const result = await response.json();
            renderOrders(Array.isArray(result.orders) ? result.orders : []);
            if (showLoadingMessage) {
                clearFeedback();
            }
        } catch (error) {
            showFeedback(error.message || "Erro ao carregar pedidos.", "error");
        }
    }

    async function updateOrderStatus(orderId, status) {
        try {
            const response = await fetch("/api/orders/" + orderId + "/status", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: status })
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Não foi possível atualizar o pedido.");
            }

            showFeedback(result.message || "Pedido atualizado com sucesso.", "success");
            await fetchOrders(false);
        } catch (error) {
            showFeedback(error.message || "Erro ao atualizar pedido.", "error");
        }
    }

    document.addEventListener("click", function (event) {
        const button = event.target.closest(".update-order-status");
        if (!button) {
            return;
        }

        updateOrderStatus(button.getAttribute("data-order-id"), button.getAttribute("data-status"));
    });

    fetchOrders(true);
    window.setInterval(function () {
        fetchOrders(false);
    }, 15000);
})();
