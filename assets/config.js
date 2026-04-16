(function () {
    var CONFIG = {
        menuUrl: './data/menu.json',
        menuStorageKey: 'doceria_frontend_menu',
        ordersStorageKey: 'doceria_frontend_orders',
        sessionStorageKey: 'doceria_frontend_session',
        adminCredentialsStorageKey: 'doceria_frontend_admin_credentials'
    };

    var STATUS_LABELS = {
        novo: 'Novo',
        em_preparo: 'Em preparo',
        pronto: 'Pronto',
        entregue: 'Entregue',
        cancelado: 'Cancelado'
    };

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function readStorage(key, fallbackValue) {
        try {
            var rawValue = localStorage.getItem(key);
            if (!rawValue) {
                return clone(fallbackValue);
            }
            return JSON.parse(rawValue);
        } catch (error) {
            return clone(fallbackValue);
        }
    }

    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    }

    function removeStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {}
    }

    async function loadDefaultMenu() {
        var response = await fetch(CONFIG.menuUrl, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('Nao foi possivel carregar o menu padrao.');
        }
        return response.json();
    }

    async function getMenu() {
        var savedMenu = readStorage(CONFIG.menuStorageKey, null);
        if (savedMenu) {
            return clone(savedMenu);
        }

        var defaultMenu = await loadDefaultMenu();
        writeStorage(CONFIG.menuStorageKey, defaultMenu);
        return clone(defaultMenu);
    }

    function getLocalOrders() {
        return readStorage(CONFIG.ordersStorageKey, []);
    }

    function saveLocalOrders(orders) {
        if (!writeStorage(CONFIG.ordersStorageKey, orders)) {
            throw new Error('Nao foi possivel salvar os pedidos no navegador.');
        }
    }

    async function getOrders() {
        return getLocalOrders();
    }

    async function createOrder(payload) {
        var localOrders = getLocalOrders();
        var nextId = localOrders.reduce(function (maxId, order) {
            return Math.max(maxId, Number(order.id) || 0);
        }, 0) + 1;

        var items = Array.isArray(payload.items) ? payload.items : [];
        var total = items.reduce(function (sum, item) {
            return sum + Number(item.subtotal || 0);
        }, 0);

        var order = {
            id: nextId,
            customer_name: payload.customer_name,
            table_number: payload.table_number,
            notes: payload.notes || '',
            status: 'novo',
            status_label: STATUS_LABELS.novo,
            total: total,
            created_at: new Date().toISOString(),
            item_count: items.reduce(function (sum, item) {
                return sum + Number(item.quantity || 0);
            }, 0),
            items: items.map(function (item) {
                return {
                    id: item.id,
                    name: item.name,
                    quantity: Number(item.quantity || 0),
                    unit_price: Number(item.unit_price || 0),
                    subtotal: Number(item.subtotal || 0)
                };
            })
        };

        localOrders.unshift(order);
        saveLocalOrders(localOrders);
        return clone(order);
    }

    async function findOrderById(orderId) {
        return getLocalOrders().find(function (order) {
            return String(order.id) === String(orderId);
        }) || null;
    }

    async function updateOrderStatus(orderId, status) {
        var orders = getLocalOrders().map(function (order) {
            if (String(order.id) !== String(orderId)) {
                return order;
            }
            return Object.assign({}, order, {
                status: status,
                status_label: STATUS_LABELS[status] || status
            });
        });
        saveLocalOrders(orders);
        return orders.find(function (order) {
            return String(order.id) === String(orderId);
        }) || null;
    }

    async function getSession() {
        return readStorage(CONFIG.sessionStorageKey, { authenticated: false });
    }

    function saveSession(session) {
        writeStorage(CONFIG.sessionStorageKey, session);
    }

    async function signInAdmin(email, password) {
        var localCredentials = readStorage(CONFIG.adminCredentialsStorageKey, { username: 'admin', password: '123456' });
        if (email !== localCredentials.username || password !== localCredentials.password) {
            throw new Error('Usuario ou senha invalidos.');
        }
        saveSession({ authenticated: true, email: email });
    }

    async function signOut() {
        removeStorage(CONFIG.sessionStorageKey);
    }

    async function updateAdminCredentials(credentials) {
        var nextEmail = String(credentials.email || '').trim();
        var nextPassword = String(credentials.password || '').trim();
        if (!nextEmail) {
            throw new Error('Informe um e-mail valido.');
        }
        if (nextPassword && nextPassword.length < 6) {
            throw new Error('A senha deve ter no minimo 6 caracteres.');
        }
        var currentCredentials = readStorage(CONFIG.adminCredentialsStorageKey, { username: nextEmail, password: '123456' });
        if (!writeStorage(CONFIG.adminCredentialsStorageKey, { username: nextEmail, password: nextPassword || currentCredentials.password })) {
            throw new Error('Nao foi possivel salvar as credenciais do administrador.');
        }
        saveSession({ authenticated: true, email: nextEmail });
    }

    function uploadMenuImage(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result || '');
            };
            reader.onerror = function () {
                reject(new Error('Nao foi possivel carregar a imagem selecionada.'));
            };
            reader.readAsDataURL(file);
        });
    }

    function getStatusLabel(status) {
        return STATUS_LABELS[status] || status;
    }

    window.cardapioConfig = CONFIG;
    window.cardapioStore = {
        clone: clone,
        getMenu: getMenu,
        saveMenu: saveMenu,
        getOrders: getOrders,
        createOrder: createOrder,
        findOrderById: findOrderById,
        updateOrderStatus: updateOrderStatus,
        getSession: getSession,
        saveSession: saveSession,
        signInAdmin: signInAdmin,
        signInWithGitHub: function () { return Promise.reject(new Error('Login com GitHub nao esta disponivel no modo local.')); },
        signOut: signOut,
        updateAdminCredentials: updateAdminCredentials,
        uploadMenuImage: uploadMenuImage,
        getStatusLabel: getStatusLabel
    };

    function saveMenu(menu) {
        if (!writeStorage(CONFIG.menuStorageKey, menu)) {
            throw new Error('Nao foi possivel salvar o cardapio no navegador.');
        }
    }
})();
