(function () {
    var CONFIG = {
        menuUrl: "./data/menu.json",
        menuStorageKey: "doceria_frontend_menu",
        ordersStorageKey: "doceria_frontend_orders",
        sessionStorageKey: "doceria_frontend_session",
        adminCredentialsStorageKey: "doceria_frontend_admin_credentials",
        menuImagesBucket: (window.cardapioFirebaseConfig && window.cardapioFirebaseConfig.bucket) || "menu-images"
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

    function getFirebaseApp() {
        return window.cardapioFirebase || null;
    }

    function getFirebaseAuth() {
        return window.cardapioFirebaseAuth || null;
    }

    function getFirestore() {
        return window.cardapioFirestore || null;
    }

    function getFirebaseStorage() {
        return window.cardapioStorage || null;
    }

    function isRemoteEnabled() {
        return Boolean(getFirebaseApp());
    }

    function getSetupMessage() {
        return "Firebase nao configurado. Preencha assets/firebase-config.js com suas credenciais do Firebase.";
    }

    function requireFirebase() {
        var firebase = getFirebaseApp();
        if (!firebase) {
            throw new Error(getSetupMessage());
        }
        return firebase;
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
        var firestore = getFirestore();
        var fallbackMenu = await loadDefaultMenu();

        try {
            var settingsDoc = await firestore.collection("settings").doc("restaurant").get();
            var itemsQuery = await firestore.collection("menu_items").orderBy("sort_order").orderBy("id").get();

            var settingsData = settingsDoc.exists ? settingsDoc.data() : null;
            var itemsData = itemsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            return groupItemsAsMenu(settingsData, itemsData, fallbackMenu);
        } catch (error) {
            throw new Error(error.message || "Nao foi possivel carregar o cardapio.");
        }
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
        var firestore = getFirestore();
        var flattenedItems = flattenItems(menu);

        try {
            // Save settings
            var settingsRef = firestore.collection("settings").doc("restaurant");
            await settingsRef.set({
                restaurant_name: menu.restaurant_name || "",
                whatsapp: menu.whatsapp || "",
                updated_at: new Date()
            });

            // Get existing items
            var existingItems = await firestore.collection("menu_items").get();
            var existingIds = existingItems.docs.map(doc => doc.id);

            // Determine items to delete
            var nextIds = flattenedItems.map(item => item.id.toString());
            var idsToDelete = existingIds.filter(id => !nextIds.includes(id));

            // Delete old items
            var deletePromises = idsToDelete.map(id =>
                firestore.collection("menu_items").doc(id).delete()
            );
            await Promise.all(deletePromises);

            // Save new/updated items
            var savePromises = flattenedItems.map(item => {
                var docRef = firestore.collection("menu_items").doc(item.id.toString());
                return docRef.set({
                    ...item,
                    updated_at: new Date()
                });
            });
            await Promise.all(savePromises);

        } catch (error) {
            throw new Error(error.message || "Nao foi possivel salvar o cardapio.");
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
        var firestore = getFirestore();

        try {
            var ordersQuery = await firestore.collection("orders").orderBy("created_at", "desc").get();
            var orders = ordersQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (!orders.length) {
                return [];
            }

            // Get order items for all orders
            var orderIds = orders.map(order => order.id);
            var itemsPromises = orderIds.map(orderId =>
                firestore.collection("orders").doc(orderId).collection("items").get()
            );
            var itemsResults = await Promise.all(itemsPromises);

            var itemsByOrderId = {};
            itemsResults.forEach((querySnapshot, index) => {
                var orderId = orderIds[index];
                itemsByOrderId[orderId] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            });

            return orders.map(order => normalizeOrder(order, itemsByOrderId[order.id] || []));
        } catch (error) {
            throw new Error(error.message || "Nao foi possivel carregar os pedidos.");
        }
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

        var firestore = getFirestore();
        var total = payload.items.reduce(function (sum, item) {
            return sum + Number(item.subtotal);
        }, 0);
        var itemCount = payload.items.reduce(function (sum, item) {
            return sum + Number(item.quantity);
        }, 0);

        try {
            // Create order document
            var orderRef = firestore.collection("orders").doc();
            var orderData = {
                customer_name: payload.customer_name,
                table_number: payload.table_number,
                notes: payload.notes,
                status: "novo",
                total: total,
                item_count: itemCount,
                created_at: new Date()
            };

            await orderRef.set(orderData);

            // Create order items subcollection
            var itemsPromises = payload.items.map(item =>
                orderRef.collection("items").add({
                    item_id: item.id,
                    name: item.name,
                    quantity: Number(item.quantity),
                    unit_price: Number(item.unit_price),
                    subtotal: Number(item.subtotal)
                })
            );

            await Promise.all(itemsPromises);

            // Get the created order with items
            return await findOrderById(orderRef.id);
        } catch (error) {
            throw new Error(error.message || "Nao foi possivel criar o pedido.");
        }
    }

    async function findOrderById(orderId) {
        if (!isRemoteEnabled()) {
            return getLocalOrders().find(function (order) {
                return String(order.id) === String(orderId);
            }) || null;
        }

        var firestore = getFirestore();

        try {
            var orderDoc = await firestore.collection("orders").doc(orderId).get();
            if (!orderDoc.exists) {
                return null;
            }

            var orderData = { id: orderDoc.id, ...orderDoc.data() };
            var itemsQuery = await orderDoc.ref.collection("items").get();
            var itemsData = itemsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            return normalizeOrder(orderData, itemsData);
        } catch (error) {
            throw new Error(error.message || "Nao foi possivel carregar o pedido.");
        }
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

        var firestore = getFirestore();

        try {
            await firestore.collection("orders").doc(orderId).update({
                status: status
            });

            return await findOrderById(orderId);
        } catch (error) {
            throw new Error(error.message || "Nao foi possivel atualizar o status do pedido.");
        }
    }

    async function getSession() {
        if (!isRemoteEnabled()) {
            return readStorage(CONFIG.sessionStorageKey, { authenticated: false });
        }

        var auth = getFirebaseAuth();
        var user = auth.currentUser;

        return {
            authenticated: Boolean(user),
            email: user ? user.email || user.displayName || "" : "",
            user: user || null
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

        var auth = getFirebaseAuth();
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            throw new Error(error.message || "Nao foi possivel fazer login.");
        }
    }

    async function signInWithGitHub() {
        if (!isRemoteEnabled()) {
            throw new Error("Login com GitHub requer configuracao remota.");
        }

        var auth = getFirebaseAuth();
        
        try {
            var provider = new window.firebase.auth.GithubAuthProvider();
            provider.addScope('user:email');
            provider.setCustomParameters({
                'allow_signup': 'true'
            });

            var result = await auth.signInWithPopup(provider);
            
            // Redirect to admin after successful login
            if (result.user) {
                window.location.href = "./admin.html";
            }
        } catch (error) {
            // Handle specific Firebase errors
            if (error.code === 'auth/popup-blocked') {
                throw new Error("Pop-up foi bloqueado. Verifique suas configuracoes de navegador.");
            } else if (error.code === 'auth/popup-closed-by-user') {
                throw new Error("Login cancelado pelo usuario.");
            } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
                throw new Error("Pop-ups nao sao suportados neste navegador.");
            } else if (error.code === 'auth/unauthorized-domain') {
                throw new Error("Dominio nao autorizado no Firebase. Configure em Authentication > Settings > Authorized domains.");
            } else {
                throw new Error(error.message || "Nao foi possivel fazer login com GitHub.");
            }
        }
    }

    async function signOut() {
        if (!isRemoteEnabled()) {
            removeStorage(CONFIG.sessionStorageKey);
            return;
        }

        var auth = getFirebaseAuth();
        try {
            await auth.signOut();
        } catch (error) {
            throw new Error(error.message || "Nao foi possivel sair da conta.");
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

        // Firebase-based admin credential update is not implemented in this frontend.
        throw new Error("Atualizacao de credenciais administrativas via Firebase nao esta disponivel no frontend.");
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

        var storage = getFirebaseStorage();
        var extension = "";
        var nameParts = String(file.name || "imagem").split(".");

        if (nameParts.length > 1) {
            extension = "." + nameParts.pop().toLowerCase();
        }

        var filePath = "menu/" + Date.now() + "-" + Math.random().toString(36).slice(2) + extension;

        try {
            var storageRef = storage.ref();
            var imageRef = storageRef.child(filePath);
            var uploadTask = await imageRef.put(file);
            var downloadURL = await uploadTask.ref.getDownloadURL();
            return downloadURL;
        } catch (error) {
            throw new Error(error.message || "Nao foi possivel enviar a imagem para o armazenamento.");
        }
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
        signInWithGitHub: signInWithGitHub,
        signOut: signOut,
        updateAdminCredentials: updateAdminCredentials,
        uploadMenuImage: uploadMenuImage,
        getStatusLabel: getStatusLabel,
        isRemoteEnabled: isRemoteEnabled,
        getSetupMessage: getSetupMessage
    };
})();
