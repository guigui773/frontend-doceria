(function () {
    var CONFIG = {
        menuUrl: "./data/menu.json",
        menuStorageKey: "doceria_frontend_menu",
        ordersStorageKey: "doceria_frontend_orders",
        sessionStorageKey: "doceria_frontend_session",
        adminCredentialsStorageKey: "doceria_frontend_admin_credentials",
        menuImagesBucket: (window.cardapioSupabaseConfig && window.cardapioSupabaseConfig.bucket) || "menu-images"
    };

    var STATUS_LABELS = {
        novo: "Novo",
        em_preparo: "Em preparo",
        pronto: "Pronto",
        entregue: "Entregue",
        cancelado: "Cancelado"
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
        } catch (error) {
            return;
        }
    }

    function getSupabaseClient() {
        return window.cardapioSupabase || null;
    }

    function isRemoteEnabled() {
        return Boolean(getSupabaseClient());
    }

    function getSetupMessage() {
        return "Supabase nao configurado. Preencha assets/supabase-config.js para ativar armazenamento permanente.";
    }

    function requireSupabase() {
        var supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error(getSetupMessage());
        }

        return supabase;
    }

    async function loadDefaultMenu() {
        var response = await fetch(CONFIG.menuUrl, { cache: "no-store" });
        if (!response.ok) {
            throw new Error("Nao foi possivel carregar o menu padrao.");
        }

        return response.json();
    }

    function flattenItems(menu) {
        var categories = Array.isArray(menu.categories) ? menu.categories : [];
        return categories.flatMap(function (category, categoryIndex) {
            var items = Array.isArray(category.items) ? category.items : [];
            return items.map(function (item, itemIndex) {
                return {
                    id: Number(item.id),
                    category: category.name,
                    name: item.name,
                    description: item.description || "",
                    price: Number(item.price || 0),
                    image: item.image || "",
                    sort_order: categoryIndex * 1000 + itemIndex
                };
            });
        });
    }

    function groupItemsAsMenu(settingsRow, itemRows, fallbackMenu) {
        var grouped = {};

        (itemRows || []).forEach(function (item) {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }

            grouped[item.category].push({
                id: item.id,
                name: item.name,
                description: item.description || "",
                price: Number(item.price || 0),
                image: item.image || ""
            });
        });

        return {
            menu_version: settingsRow && settingsRow.updated_at ? settingsRow.updated_at : (fallbackMenu && fallbackMenu.menu_version) || "",
            restaurant_name: (settingsRow && settingsRow.restaurant_name) || (fallbackMenu && fallbackMenu.restaurant_name) || "Cardapio Digital",
            whatsapp: (settingsRow && settingsRow.whatsapp) || (fallbackMenu && fallbackMenu.whatsapp) || "",
            categories: Object.keys(grouped).sort(function (a, b) {
                return a.localeCompare(b, "pt-BR");
            }).map(function (categoryName) {
                return {
                    name: categoryName,
                    items: grouped[categoryName].sort(function (a, b) {
                        return Number(a.id) - Number(b.id);
                    })
                };
            })
        };
    }

    async function getRemoteMenu() {
        var supabase = requireSupabase();
        var fallbackMenu = await loadDefaultMenu();
        var results = await Promise.all([
            supabase.from("restaurant_settings").select("*").eq("id", 1).maybeSingle(),
            supabase.from("menu_items").select("*").order("sort_order", { ascending: true }).order("id", { ascending: true })
        ]);

        var settingsResult = results[0];
        var itemsResult = results[1];

        if (settingsResult.error) {
            throw new Error(settingsResult.error.message || "Nao foi possivel carregar as configuracoes do restaurante.");
        }

        if (itemsResult.error) {
            throw new Error(itemsResult.error.message || "Nao foi possivel carregar os itens do cardapio.");
        }

        if (!settingsResult.data && !(itemsResult.data || []).length) {
            return fallbackMenu;
        }

        return groupItemsAsMenu(settingsResult.data, itemsResult.data || [], fallbackMenu);
    }

    async function getMenu() {
        if (isRemoteEnabled()) {
            return getRemoteMenu();
        }

        var savedMenu = readStorage(CONFIG.menuStorageKey, null);
        if (savedMenu) {
            return savedMenu;
        }

        var defaultMenu = await loadDefaultMenu();
        writeStorage(CONFIG.menuStorageKey, defaultMenu);
        return clone(defaultMenu);
    }

    async function saveRemoteMenu(menu) {
        var supabase = requireSupabase();
        var flattenedItems = flattenItems(menu);
        var timestamp = new Date().toISOString();
        var settingsPayload = {
            id: 1,
            restaurant_name: menu.restaurant_name || "",
            whatsapp: menu.whatsapp || "",
            updated_at: timestamp
        };
        var existingResult = await supabase.from("menu_items").select("id");

        if (existingResult.error) {
            throw new Error(existingResult.error.message || "Nao foi possivel verificar os itens atuais do cardapio.");
        }

        var nextIds = flattenedItems.map(function (item) {
            return Number(item.id);
        });
        var existingIds = (existingResult.data || []).map(function (item) {
            return Number(item.id);
        });
        var idsToDelete = existingIds.filter(function (id) {
            return nextIds.indexOf(id) === -1;
        });

        if (idsToDelete.length) {
            var deleteResult = await supabase.from("menu_items").delete().in("id", idsToDelete);
            if (deleteResult.error) {
                throw new Error(deleteResult.error.message || "Nao foi possivel remover itens antigos do cardapio.");
            }
        }

        if (flattenedItems.length) {
            var upsertResult = await supabase.from("menu_items").upsert(flattenedItems, {
                onConflict: "id"
            });

            if (upsertResult.error) {
                throw new Error(upsertResult.error.message || "Nao foi possivel salvar os itens do cardapio.");
            }
        }

        var settingsResult = await supabase.from("restaurant_settings").upsert(settingsPayload, {
            onConflict: "id"
        });

        if (settingsResult.error) {
            throw new Error(settingsResult.error.message || "Nao foi possivel salvar as configuracoes do restaurante.");
        }
    }

    async function saveMenu(menu) {
        if (isRemoteEnabled()) {
            await saveRemoteMenu(menu);
            return;
        }

        if (!writeStorage(CONFIG.menuStorageKey, menu)) {
            throw new Error("Nao foi possivel salvar o cardapio no navegador.");
        }
    }

    function getLocalOrders() {
        return readStorage(CONFIG.ordersStorageKey, []);
    }

    function saveLocalOrders(orders) {
        if (!writeStorage(CONFIG.ordersStorageKey, orders)) {
            throw new Error("Nao foi possivel salvar os pedidos no navegador.");
        }
    }

    function normalizeOrder(orderRow, orderItems) {
        return {
            id: orderRow.id,
            customer_name: orderRow.customer_name,
            table_number: orderRow.table_number,
            notes: orderRow.notes || "",
            status: orderRow.status,
            status_label: STATUS_LABELS[orderRow.status] || orderRow.status,
            total: Number(orderRow.total || 0),
            created_at: orderRow.created_at,
            item_count: Number(orderRow.item_count || 0),
            items: (orderItems || []).map(function (item) {
                return {
                    id: item.item_id,
                    name: item.name,
                    quantity: Number(item.quantity || 0),
                    unit_price: Number(item.unit_price || 0),
                    subtotal: Number(item.subtotal || 0)
                };
            })
        };
    }

    async function getRemoteOrders() {
        var supabase = requireSupabase();
        var ordersResult = await supabase.from("orders").select("*").order("created_at", { ascending: false });

        if (ordersResult.error) {
            throw new Error(ordersResult.error.message || "Nao foi possivel carregar os pedidos.");
        }

        var orders = ordersResult.data || [];
        if (!orders.length) {
            return [];
        }

        var orderIds = orders.map(function (order) {
            return order.id;
        });
        var itemsResult = await supabase.from("order_items").select("*").in("order_id", orderIds).order("id", { ascending: true });

        if (itemsResult.error) {
            throw new Error(itemsResult.error.message || "Nao foi possivel carregar os itens dos pedidos.");
        }

        var itemsByOrderId = {};
        (itemsResult.data || []).forEach(function (item) {
            if (!itemsByOrderId[item.order_id]) {
                itemsByOrderId[item.order_id] = [];
            }

            itemsByOrderId[item.order_id].push(item);
        });

        return orders.map(function (order) {
            return normalizeOrder(order, itemsByOrderId[order.id] || []);
        });
    }

    async function getOrders() {
        if (isRemoteEnabled()) {
            return getRemoteOrders();
        }

        return getLocalOrders();
    }

    async function createOrder(payload) {
        if (!isRemoteEnabled()) {
            var localOrders = getLocalOrders();
            var nextId = localOrders.reduce(function (maxId, order) {
                return Math.max(maxId, Number(order.id) || 0);
            }, 0) + 1;
            var total = payload.items.reduce(function (sum, item) {
                return sum + Number(item.subtotal);
            }, 0);
            var localOrder = {
                id: nextId,
                customer_name: payload.customer_name,
                table_number: payload.table_number,
                notes: payload.notes,
                status: "novo",
                status_label: STATUS_LABELS.novo,
                total: total,
                created_at: new Date().toISOString(),
                item_count: payload.items.reduce(function (sum, item) {
                    return sum + Number(item.quantity);
                }, 0),
                items: payload.items
            };

            localOrders.unshift(localOrder);
            saveLocalOrders(localOrders);
            return localOrder;
        }

        var supabase = requireSupabase();
        var total = payload.items.reduce(function (sum, item) {
            return sum + Number(item.subtotal);
        }, 0);
        var itemCount = payload.items.reduce(function (sum, item) {
            return sum + Number(item.quantity);
        }, 0);
        var orderResult = await supabase.from("orders").insert({
            customer_name: payload.customer_name,
            table_number: payload.table_number,
            notes: payload.notes,
            status: "novo",
            total: total,
            item_count: itemCount
        }).select("*").single();

        if (orderResult.error) {
            throw new Error(orderResult.error.message || "Nao foi possivel criar o pedido.");
        }

        var orderItemRows = payload.items.map(function (item) {
            return {
                order_id: orderResult.data.id,
                item_id: item.id,
                name: item.name,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                subtotal: Number(item.subtotal)
            };
        });
        var orderItemsResult = await supabase.from("order_items").insert(orderItemRows).select("*");

        if (orderItemsResult.error) {
            throw new Error(orderItemsResult.error.message || "Nao foi possivel salvar os itens do pedido.");
        }

        return normalizeOrder(orderResult.data, orderItemsResult.data || []);
    }

    async function findOrderById(orderId) {
        if (!isRemoteEnabled()) {
            return getLocalOrders().find(function (order) {
                return String(order.id) === String(orderId);
            }) || null;
        }

        var supabase = requireSupabase();
        var orderResult = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();

        if (orderResult.error) {
            throw new Error(orderResult.error.message || "Nao foi possivel consultar o pedido.");
        }

        if (!orderResult.data) {
            return null;
        }

        var itemsResult = await supabase.from("order_items").select("*").eq("order_id", orderId).order("id", { ascending: true });

        if (itemsResult.error) {
            throw new Error(itemsResult.error.message || "Nao foi possivel carregar os itens do pedido.");
        }

        return normalizeOrder(orderResult.data, itemsResult.data || []);
    }

    async function updateOrderStatus(orderId, status) {
        if (!isRemoteEnabled()) {
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

        var supabase = requireSupabase();
        var updateResult = await supabase.from("orders").update({
            status: status
        }).eq("id", orderId).select("*").maybeSingle();

        if (updateResult.error) {
            throw new Error(updateResult.error.message || "Nao foi possivel atualizar o status do pedido.");
        }

        if (!updateResult.data) {
            return null;
        }

        return findOrderById(orderId);
    }

    async function getSession() {
        if (!isRemoteEnabled()) {
            return readStorage(CONFIG.sessionStorageKey, { authenticated: false });
        }

        var supabase = requireSupabase();
        var sessionResult = await supabase.auth.getSession();

        if (sessionResult.error) {
            throw new Error(sessionResult.error.message || "Nao foi possivel recuperar a sessao atual.");
        }

        return {
            authenticated: Boolean(sessionResult.data.session),
            email: sessionResult.data.session && sessionResult.data.session.user ? sessionResult.data.session.user.email || "" : "",
            session: sessionResult.data.session || null
        };
    }

    function saveSession(session) {
        if (!isRemoteEnabled()) {
            writeStorage(CONFIG.sessionStorageKey, session);
        }
    }

    async function signInAdmin(email, password) {
        if (!isRemoteEnabled()) {
            var localCredentials = readStorage(CONFIG.adminCredentialsStorageKey, {
                username: "admin",
                password: "123456"
            });

            if (email !== localCredentials.username || password !== localCredentials.password) {
                throw new Error("Usuario ou senha invalidos.");
            }

            saveSession({
                authenticated: true,
                email: email
            });
            return;
        }

        var supabase = requireSupabase();
        var signInResult = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (signInResult.error) {
            throw new Error(signInResult.error.message || "Nao foi possivel fazer login.");
        }
    }

    async function signOut() {
        if (!isRemoteEnabled()) {
            removeStorage(CONFIG.sessionStorageKey);
            return;
        }

        var supabase = requireSupabase();
        var signOutResult = await supabase.auth.signOut({ scope: "local" });

        if (signOutResult.error) {
            throw new Error(signOutResult.error.message || "Nao foi possivel sair da conta.");
        }
    }

    async function updateAdminCredentials(credentials) {
        if (!isRemoteEnabled()) {
            if (!writeStorage(CONFIG.adminCredentialsStorageKey, {
                username: credentials.email,
                password: credentials.password
            })) {
                throw new Error("Nao foi possivel salvar as credenciais do administrador.");
            }

            return;
        }

        var supabase = requireSupabase();
        var updates = {};

        if (credentials.email) {
            updates.email = credentials.email;
        }

        if (credentials.password) {
            updates.password = credentials.password;
        }

        var updateResult = await supabase.auth.updateUser(updates);

        if (updateResult.error) {
            throw new Error(updateResult.error.message || "Nao foi possivel atualizar os dados do administrador.");
        }
    }

    async function uploadMenuImage(file) {
        if (!isRemoteEnabled()) {
            return new Promise(function (resolve, reject) {
                var reader = new FileReader();

                reader.onload = function () {
                    resolve(reader.result || "");
                };

                reader.onerror = function () {
                    reject(new Error("Nao foi possivel carregar a imagem selecionada."));
                };

                reader.readAsDataURL(file);
            });
        }

        var supabase = requireSupabase();
        var extension = "";
        var nameParts = String(file.name || "imagem").split(".");

        if (nameParts.length > 1) {
            extension = "." + nameParts.pop().toLowerCase();
        }

        var filePath = "menu/" + Date.now() + "-" + Math.random().toString(36).slice(2) + extension;
        var uploadResult = await supabase.storage.from(CONFIG.menuImagesBucket).upload(filePath, file, {
            cacheControl: "3600",
            upsert: false
        });

        if (uploadResult.error) {
            throw new Error(uploadResult.error.message || "Nao foi possivel enviar a imagem para o armazenamento.");
        }

        var publicUrlResult = supabase.storage.from(CONFIG.menuImagesBucket).getPublicUrl(filePath);
        if (!publicUrlResult.data || !publicUrlResult.data.publicUrl) {
            throw new Error("Nao foi possivel gerar o link publico da imagem.");
        }

        return publicUrlResult.data.publicUrl;
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
        signOut: signOut,
        updateAdminCredentials: updateAdminCredentials,
        uploadMenuImage: uploadMenuImage,
        getStatusLabel: getStatusLabel,
        isRemoteEnabled: isRemoteEnabled,
        getSetupMessage: getSetupMessage
    };
})();
