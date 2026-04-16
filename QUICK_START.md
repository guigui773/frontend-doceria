# ⚡ Quick Start - Integração GitHub OAuth + Firebase

## 🎯 Resumo Executivo

Seu projeto **já está preparado** para GitHub OAuth! Basta seguir estes 3 passos rápidos:

1. **Criar projeto no Firebase** (2 minutos)
2. **Criar OAuth App no GitHub** (2 minutos)  
3. **Conectar as credenciais** (3 minutos)

**Tempo total: ~7 minutos**

---

## 🚀 PASSO 1️⃣: Criar Projeto Firebase

```
1. Acesse: https://console.firebase.google.com/
2. Clique: "Criar um projeto"
3. Nome: la-mafia-dolci
4. Aguarde 2-3 minutos
```

✅ **Pronto!**

---

## 🚀 PASSO 2️⃣: Criar OAuth App no GitHub

```
1. Acesse: https://github.com/settings/developers
2. Clique: "New OAuth App"
3. Preencha:
   - Application name: La Mafia dei Dolci Admin
   - Homepage URL: http://localhost:8000
   - Authorization callback URL: [deixe em branco]
4. Clique: "Register application"
5. COPIE: Client ID + Client Secret
```

✅ **Pronto! Guarde essas credenciais**

---

## 🚀 PASSO 3️⃣: Conectar Credenciais no Firebase

### 3A. Configurar GitHub no Firebase

```
1. Firebase Console > seu projeto
2. Menu > Authentication > Sign-in method
3. Clique em "GitHub"
4. Ative o toggle (ficará azul)
5. Cole Client ID + Client Secret do GitHub
6. Clique "Save"
7. COPIE a "Authorization callback URL"
```

### 3B. Completar GitHub OAuth App

```
1. Volte para: https://github.com/settings/developers
2. Clique em seu app
3. Edite "Authorization callback URL"
4. Cole a URL do Firebase (passo anterior)
5. Clique "Update application"
```

✅ **Pronto! GitHub OAuth está conectado**

---

## 🚀 PASSO 4️⃣: Obter Credenciais do Firebase

```
1. Firebase Console > ⚙️ (engrenagem) > Project settings
2. Role até "Seus apps"
3. Copie a config do app web (ou crie um se não existir)
4. COPIE as 6 linhas de credenciais
```

---

## 🚀 PASSO 5️⃣: Atualizar `assets/firebase-config.js`

```javascript
// Abra: assets/firebase-config.js
// Substitua pelos valores do passo anterior:

(function () {
    window.firebaseConfig = {
        apiKey: "SUA_API_KEY_AQUI",
        authDomain: "la-mafia-dolci.firebaseapp.com",
        projectId: "la-mafia-dolci",
        storageBucket: "la-mafia-dolci.appspot.com",
        messagingSenderId: "SEU_SENDER_ID",
        appId: "SEU_APP_ID"
    };
})();
```

✅ **SALVE O ARQUIVO**

---

## 🚀 PASSO 6️⃣: Autorizar Domínios

```
1. Firebase Console > Authentication > Settings
2. Authorized domains > Add domain
3. Adicione: localhost
4. Pronto para desenvolvimento!
```

---

## ✅ Testar Funcionamento

```bash
# Terminal 1: Inicie um servidor local
python -m http.server 8000

# Abra no navegador:
http://localhost:8000/verify-setup.html
```

Veja o status de tudo lá! 🎉

---

## 🔗 Links Úteis

| O quê | Onde |
|-------|------|
| Firebase Console | https://console.firebase.google.com/ |
| GitHub OAuth Apps | https://github.com/settings/developers |
| Documentação Firebase | https://firebase.google.com/docs/auth |
| Documentação GitHub OAuth | https://docs.github.com/en/developers/apps/building-oauth-apps |

---

## 🆘 Algo Deu Errado?

### Erro: "Domínio não autorizado"
→ Adicione seu domínio em Firebase > Authentication > Settings > Authorized domains

### Erro: "Invalid Client ID"  
→ Verifique se copiou corretamente do GitHub

### Pop-up bloqueado
→ Desabilite adblocker ou permita pop-ups para este site

### Preciso de ajuda?
→ Consulte [GITHUB_OAUTH_SETUP.md](GITHUB_OAUTH_SETUP.md) para guia completo

---

## 📂 Arquivos Importantes

- **assets/firebase-config.js** ← Coloque suas credenciais aqui
- **assets/firebase-client.js** ← Inicializa Firebase (já pronto)
- **assets/config.js** ← Lógica de autenticação (já pronta)
- **login.html** ← Página de login com botão GitHub (já pronta)
- **verify-setup.html** ← Página de verificação de setup

---

## 🎉 Pronto!

Após completar todos os passos, você poderá:
- ✅ Fazer login com GitHub
- ✅ Salvar dados no Firestore
- ✅ Enviar imagens para Storage
- ✅ Gerenciar cardápio administrativamente

Bom trabalho! 🚀
