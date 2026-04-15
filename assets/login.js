(function () {
    var loginForm = document.getElementById("login-form");
    var feedback = document.getElementById("login-feedback");
    var usernameInput = document.getElementById("username");
    var passwordInput = document.getElementById("password");
    var githubLoginButton = document.getElementById("github-login-button");

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

    async function redirectIfLoggedIn() {
        try {
            var session = await window.cardapioStore.getSession();
            if (session.authenticated) {
                window.location.href = "./admin.html";
            }
        } catch (error) {
            showFeedback(error.message || "Nao foi possivel verificar a sessao atual.", "error");
        }
    }

    async function submitLogin(event) {
        event.preventDefault();
        clearFeedback();

        try {
            await window.cardapioStore.signInAdmin(
                usernameInput.value.trim(),
                passwordInput.value.trim()
            );
        } catch (error) {
            showFeedback(error.message || "Nao foi possivel fazer login.", "error");
            return;
        }

        showFeedback("Login realizado com sucesso.", "success");
        window.setTimeout(function () {
            window.location.href = "./admin.html";
        }, 300);
    }

    async function submitGitHubLogin(event) {
        event.preventDefault();
        clearFeedback();
        githubLoginButton.disabled = true;

        try {
            await window.cardapioStore.signInWithGitHub();
            // signInWithGitHub redireciona automaticamente após login bem-sucedido
        } catch (error) {
            showFeedback(error.message || "Nao foi possivel fazer login com GitHub.", "error");
            githubLoginButton.disabled = false;
        }
    }

    loginForm.addEventListener("submit", submitLogin);
    githubLoginButton.addEventListener("click", submitGitHubLogin);
    redirectIfLoggedIn();
})();
