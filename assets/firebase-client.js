(function () {
    var config = window.firebaseConfig || {};
    var apiKey = String(config.apiKey || "").trim();
    var authDomain = String(config.authDomain || "").trim();
    var projectId = String(config.projectId || "").trim();
    var storageBucket = String(config.storageBucket || "").trim();
    var messagingSenderId = String(config.messagingSenderId || "").trim();
    var appId = String(config.appId || "").trim();

    if (!window.firebase || !apiKey || !projectId) {
        window.cardapioFirebase = null;
        window.cardapioFirebaseAuth = null;
        window.cardapioFirestore = null;
        window.cardapioStorage = null;
        return;
    }

    try {
        // Initialize Firebase
        var firebaseApp = window.firebase.initializeApp({
            apiKey: apiKey,
            authDomain: authDomain,
            projectId: projectId,
            storageBucket: storageBucket,
            messagingSenderId: messagingSenderId,
            appId: appId
        });

        window.cardapioFirebase = firebaseApp;
        window.cardapioFirebaseAuth = window.firebase.auth();
        window.cardapioFirestore = window.firebase.firestore();
        window.cardapioStorage = window.firebase.storage();

        // Listen for auth state changes
        window.cardapioFirebaseAuth.onAuthStateChanged(function (user) {
            // Only save session if cardapioStore is ready
            if (window.cardapioStore && window.cardapioStore.saveSession) {
                if (user) {
                    window.cardapioStore.saveSession({
                        authenticated: true,
                        email: user.email || user.displayName || '',
                        user: user
                    });
                } else {
                    window.cardapioStore.saveSession({
                        authenticated: false,
                        email: '',
                        user: null
                    });
                }
            }
        });
    } catch (error) {
        console.error("Firebase initialization error:", error);
        window.cardapioFirebase = null;
        window.cardapioFirebaseAuth = null;
        window.cardapioFirestore = null;
        window.cardapioStorage = null;
    }
})();