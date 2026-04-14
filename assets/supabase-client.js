(function () {
    var config = window.supabaseConfig || {};
    var url = String(config.url || "").trim();
    var anonKey = String(config.anonKey || "").trim();

    window.cardapioSupabaseConfig = {
        url: url,
        anonKey: anonKey,
        bucket: String(config.bucket || "menu-images").trim() || "menu-images"
    };

    if (!window.supabase || !url || !anonKey) {
        window.cardapioSupabase = null;
        return;
    }

    window.cardapioSupabase = window.supabase.createClient(url, anonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
})();
