(function () {
    var loginForm = document.getElementById("login-form");
    var feedback = document.getElementById("login-feedback");
    var usernameInput = document.getElementById("username");
    var passwordInput = document.getElementById("password");

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

    function redirectIfLoggedIn() {
        var session = window.cardapioStore.getSession();
        if (session.authenticated) {
            window.location.href = "./admin.html";
        }
    }

    function submitLogin(event) {
        event.preventDefault();
        clearFeedback();

        var credentials = window.cardapioStore.getAdminCredentials();

        if (
            usernameInput.value.trim() !== credentials.username ||
            passwordInput.value.trim() !== credentials.password
        ) {
            showFeedback("Usuário ou senha inválidos.", "error");
            return;
        }

        window.cardapioStore.saveSession({
            authenticated: true,
            username: usernameInput.value.trim()
        });

        showFeedback("Login realizado com sucesso.", "success");
        window.setTimeout(function () {
            window.location.href = "./admin.html";
        }, 300);
    }

    loginForm.addEventListener("submit", submitLogin);
    redirectIfLoggedIn();
})();
