(function () {
    var CONFIG = {
        menuUrl: "./data/menu.json",
        menuStorageKey: "doceria_frontend_menu",
        ordersStorageKey: "doceria_frontend_orders",
        sessionStorageKey: "doceria_frontend_session",
        adminUsername: "admin",
        adminPassword: "123456"
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
        localStorage.setItem(key, JSON.stringify(value));
    }

    async function loadDefaultMenu() {
        var response = await fetch(CONFIG.menuUrl);
        if (!response.ok) {
            throw new Error("Não foi possível carregar o menu estático.");
        }

        return response.json();
    }

    async function getMenu() {
        var savedMenu = readStorage(CONFIG.menuStorageKey, null);
        if (savedMenu) {
            return savedMenu;
        }

        var defaultMenu = await loadDefaultMenu();
        writeStorage(CONFIG.menuStorageKey, defaultMenu);
        return clone(defaultMenu);
    }

    function saveMenu(menu) {
        writeStorage(CONFIG.menuStorageKey, menu);
    }

    function getOrders() {
        return readStorage(CONFIG.ordersStorageKey, []);
    }

    function saveOrders(orders) {
        writeStorage(CONFIG.ordersStorageKey, orders);
    }

    function getSession() {
        return readStorage(CONFIG.sessionStorageKey, { authenticated: false });
    }

    function saveSession(session) {
        writeStorage(CONFIG.sessionStorageKey, session);
    }

    function clearSession() {
        localStorage.removeItem(CONFIG.sessionStorageKey);
    }

    function getStatusLabel(status) {
        var labels = {
            novo: "Novo",
            em_preparo: "Em preparo",
            pronto: "Pronto",
            entregue: "Entregue",
            cancelado: "Cancelado"
        };

        return labels[status] || status;
    }

    window.cardapioConfig = CONFIG;
    window.cardapioStore = {
        clone: clone,
        getMenu: getMenu,
        saveMenu: saveMenu,
        getOrders: getOrders,
        saveOrders: saveOrders,
        getSession: getSession,
        saveSession: saveSession,
        clearSession: clearSession,
        getStatusLabel: getStatusLabel
    };
})();
