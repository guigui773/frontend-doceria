(function () {
    var feedback = document.getElementById("orders-feedback");
    var logoutLink = document.getElementById("logout-link");
    var columns = {
        novo: document.getElementById("orders-novo"),
        em_preparo: document.getElementById("orders-em_preparo"),
        pronto: document.getElementById("orders-pronto"),
        finalizados: document.getElementById("orders-finalizados")
    };

    var statusActions = {
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
        return value ? new Date(value).toLocaleString("pt-BR") : "";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
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

    async function ensureAuthenticated() {
        try {
            var session = await window.cardapioStore.getSession();
            if (!session.authenticated) {
                window.location.href = "./login.html";
                return false;
            }

            return true;
        } catch (error) {
            showFeedback(error.message || "Nao foi possivel verificar a sessao.", "error");
            return false;
        }
    }

    function getTargetColumn(order) {
        if (order.status === "entregue" || order.status === "cancelado") {
            return columns.finalizados;
        }

        return columns[order.status] || columns.novo;
    }

    function createActionButtons(order) {
        var actions = statusActions[order.status] || [];
        var buttons = [
            '<button type="button" class="button button-secondary print-order-button" data-order-id="' + order.id + '">Imprimir</button>'
        ];

        buttons = buttons.concat(actions.map(function (action) {
            var buttonClass = action.value === "cancelado" ? "button button-danger" : "button button-secondary";
            return '<button type="button" class="' + buttonClass + ' update-order-status" data-order-id="' + order.id + '" data-status="' + action.value + '">' + action.label + '</button>';
        }));

        if (!buttons.length) {
            return '<div class="order-card-actions"><span class="muted-text">Sem acoes pendentes</span></div>';
        }

        return '<div class="order-card-actions">' + buttons.join("") + "</div>";
    }

    function createOrderCard(order) {
        var itemsHtml = order.items.map(function (item) {
            return "<li><strong>" + item.quantity + "x</strong> " + item.name + " <span>" + formatPrice(item.subtotal) + "</span></li>";
        }).join("");

        return [
            '<article class="order-card" data-order-id="' + order.id + '">',
            '<div class="order-card-top">',
            '<span class="order-badge badge-' + order.status + '">' + order.status_label + "</span>",
            "<strong>Pedido #" + order.id + "</strong>",
            "</div>",
            '<div class="order-card-meta">',
            "<span>Mesa " + order.table_number + "</span>",
            "<span>" + formatDate(order.created_at) + "</span>",
            order.customer_name ? "<span>Cliente: " + order.customer_name + "</span>" : "",
            "</div>",
            '<ul class="order-items-list">' + itemsHtml + "</ul>",
            order.notes ? '<p class="order-note">Observacoes: ' + order.notes + "</p>" : "",
            '<div class="order-total">Total: <strong>' + formatPrice(order.total) + "</strong></div>",
            createActionButtons(order),
            "</article>"
        ].join("");
    }

    function buildPrintableOrder(order) {
        var statusLabel = window.cardapioStore.getStatusLabel(order.status);
        var itemsHtml = order.items.map(function (item) {
            return '<tr><td>' + escapeHtml(item.quantity + "x " + item.name) + "</td><td>" + escapeHtml(formatPrice(item.subtotal)) + "</td></tr>";
        }).join("");

        return [
            "<!DOCTYPE html>",
            '<html lang="pt-BR">',
            "<head>",
            '<meta charset="UTF-8">',
            "<title>Pedido #" + order.id + "</title>",
            "<style>",
            "body { font-family: Arial, Helvetica, sans-serif; margin: 24px; color: #222; }",
            "h1 { margin: 0 0 8px; font-size: 24px; }",
            ".meta { margin: 0 0 16px; color: #555; }",
            ".badge { display: inline-block; margin-bottom: 16px; padding: 6px 10px; border-radius: 999px; background: #f1e6d7; font-weight: 700; }",
            "table { width: 100%; border-collapse: collapse; margin-top: 12px; }",
            "th, td { padding: 10px 0; border-bottom: 1px solid #ddd; text-align: left; }",
            "th:last-child, td:last-child { text-align: right; }",
            ".notes { margin-top: 16px; padding: 12px; border: 1px solid #ddd; background: #faf7f2; }",
            ".total { margin-top: 16px; text-align: right; font-size: 18px; font-weight: 700; }",
            "@media print { body { margin: 12px; } }",
            "</style>",
            "</head>",
            "<body>",
            "<h1>Pedido #" + escapeHtml(order.id) + "</h1>",
            '<div class="badge">' + escapeHtml(statusLabel) + "</div>",
            '<div class="meta">Cliente: ' + escapeHtml(order.customer_name || "Nao informado") + "<br>Mesa: " + escapeHtml(order.table_number || "-") + "<br>Data: " + escapeHtml(formatDate(order.created_at)) + "</div>",
            "<table>",
            "<thead><tr><th>Itens</th><th>Subtotal</th></tr></thead>",
            "<tbody>" + itemsHtml + "</tbody>",
            "</table>",
            order.notes ? '<div class="notes"><strong>Observacoes:</strong><br>' + escapeHtml(order.notes) + "</div>" : "",
            '<div class="total">Total: ' + escapeHtml(formatPrice(order.total)) + "</div>",
            "<script>window.onload = function () { window.print(); }<\/script>",
            "</body>",
            "</html>"
        ].join("");
    }

    function printOrder(order) {
        var printWindow = window.open("", "_blank", "width=720,height=900");
        if (!printWindow) {
            showFeedback("O navegador bloqueou a janela de impressao.", "error");
            return;
        }

        printWindow.document.open();
        printWindow.document.write(buildPrintableOrder(order));
        printWindow.document.close();
        showFeedback("Janela de impressao aberta com sucesso.", "success");
    }

    async function renderOrders() {
        var orders;

        Object.keys(columns).forEach(function (key) {
            columns[key].innerHTML = '<div class="empty-state">Nenhum pedido nesta etapa.</div>';
        });

        try {
            orders = await window.cardapioStore.getOrders();
        } catch (error) {
            showFeedback(error.message || "Nao foi possivel carregar os pedidos.", "error");
            return;
        }

        if (!orders.length) {
            showFeedback("Nenhum pedido salvo ainda.", "success");
            return;
        }

        clearFeedback();
        Object.keys(columns).forEach(function (key) {
            columns[key].innerHTML = "";
        });

        orders.forEach(function (order) {
            getTargetColumn(order).insertAdjacentHTML("beforeend", createOrderCard(order));
        });
    }

    async function updateOrderStatus(orderId, status) {
        try {
            await window.cardapioStore.updateOrderStatus(orderId, status);
            await renderOrders();
            showFeedback("Status do pedido atualizado com sucesso.", "success");
        } catch (error) {
            showFeedback(error.message || "Nao foi possivel atualizar o status do pedido.", "error");
        }
    }

    document.addEventListener("click", async function (event) {
        var printButton = event.target.closest(".print-order-button");
        if (printButton) {
            try {
                var printableOrder = await window.cardapioStore.findOrderById(printButton.getAttribute("data-order-id"));
                if (!printableOrder) {
                    showFeedback("Pedido nao encontrado para impressao.", "error");
                    return;
                }

                printOrder(printableOrder);
            } catch (error) {
                showFeedback(error.message || "Nao foi possivel preparar a impressao.", "error");
            }
            return;
        }

        var button = event.target.closest(".update-order-status");
        if (!button) {
            return;
        }

        updateOrderStatus(
            button.getAttribute("data-order-id"),
            button.getAttribute("data-status")
        );
    });

    logoutLink.addEventListener("click", async function (event) {
        event.preventDefault();

        try {
            await window.cardapioStore.signOut();
        } catch (error) {
            showFeedback(error.message || "Nao foi possivel encerrar a sessao.", "error");
            return;
        }

        window.location.href = "./login.html";
    });

    (async function init() {
        var authenticated = await ensureAuthenticated();
        if (!authenticated) {
            return;
        }

        renderOrders();
        window.setInterval(renderOrders, 15000);
    })();
})();
