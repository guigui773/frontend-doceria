# 🔧 Checklist - Fazendo GitHub OAuth Funcionar

Siga os passos EXATAMENTE nesta ordem:

## ✅ Passo 1: Criar Projeto Firebase

- [ ] Acesse [Firebase Console](https://console.firebase.google.com/)
- [ ] Clique "Criar projeto" 
- [ ] Nomear como: `la-mafia-dolci`
- [ ] Desabilitar Google Analytics (opcional)
- [ ] Aguarde criação

**Tempo estimado: 2 minutos**

---

## ✅ Passo 2: Criar OAuth App no GitHub

1. [ ] Acesse [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. [ ] Clique "New OAuth App"
3. [ ] Preencha EXATAMENTE assim:
   ```
   Application name: La Mafia dei Dolci Admin
   Homepage URL: http://localhost:8000
   Authorization callback URL: (deixe em branco POR ENQUANTO)
   ```
4. [ ] Clique "Register application"
5. [ ] **COPIE E GUARDE:**
   - Client ID: `_______________________________________`
   - Client Secret: `_______________________________________`

**⚠️ IMPORTANTE**: Você vai precisar desses valores no próximo passo!

---

## ✅ Passo 3: Configurar GitHub no Firebase

1. [ ] Volte para [Firebase Console](https://console.firebase.google.com/)
2. [ ] Clique no seu projeto `la-mafia-dolci`
3. [ ] Menu lateral > **Authentication**
4. [ ] Aba **"Sign-in method"**
5. [ ] Procure **"GitHub"** na lista
6. [ ] Clique nele
7. [ ] Toggle para **ATIVAR** (ficará azul)
8. [ ] Cole:
   - **Client ID**: (do GitHub)
   - **Client Secret**: (do GitHub)
9. [ ] **COPIE a Authorization callback URL** que aparece
   ```
   Deve ser algo como: https://LA-MAFIA-DOLCI.firebaseapp.com/__/auth/handler
   ```
10. [ ] Clique **"Save"**

---

## ✅ Passo 4: Completar GitHub OAuth App

1. [ ] Volte para [GitHub OAuth Apps](https://github.com/settings/developers)
2. [ ] Clique no app "La Mafia dei Dolci Admin"
3. [ ] Edite **"Authorization callback URL"**
4. [ ] Cole a URL copiada do Firebase
5. [ ] Clique **"Update application"**

---

## ✅ Passo 5: Obter Credenciais do Firebase

1. [ ] No Firebase Console, clique ⚙️ (engrenagem) > **"Project Settings"**
2. [ ] Role até "Seus apps"
3. [ ] Procure um app web (se não existir, clique "</>" para adicionar)
4. [ ] **COPIE toda a configuração:**
   ```js
   {
     apiKey: "AIzaSy...",
     authDomain: "la-mafia-dolci.firebaseapp.com",
     projectId: "la-mafia-dolci",
     storageBucket: "la-mafia-dolci.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc..."
   }
   ```

---

## ✅ Passo 6: Autorizar Domínios no Firebase

1. [ ] No Firebase Console > **Authentication**
2. [ ] Aba **"Settings"** (não é Sign-in method, é Settings logo abaixo)
3. [ ] Role até **"Authorized domains"**
4. [ ] Clique **"Add domain"**
5. [ ] Adicione: `localhost` (para desenvolvimento)
6. [ ] Depois, para produção, adicione: `SEU_USUARIO.github.io`

---

## ✅ Passo 7: Preencher Configuração

1. [ ] Abra o arquivo: `assets/firebase-config.js`
2. [ ] Substitua com as credenciais do Firebase (passo 5)
3. [ ] **SALVE O ARQUIVO**

---

## ✅ Passo 8: Habilitar Firestore e Storage

1. [ ] No Firebase Console > **Firestore Database**
2. [ ] Clique **"Criar banco de dados"**
3. [ ] Escolha **"Iniciar em modo de produção"**
4. [ ] Selecione localização: **us-central1** (ou mais próxima)
5. [ ] Clique **"Criar"**

6. [ ] Depois > **Storage**
7. [ ] Clique **"Começar"**
8. [ ] Escolha **"Iniciar em modo de produção"**
9. [ ] Mesma localização do Firestore

---

## ✅ Passo 9: Testar

1. [ ] Abra [http://localhost:8000/test-firebase.html](http://localhost:8000/test-firebase.html)
2. [ ] Verifique se tudo está ✅ verde
3. [ ] Se houver ❌ vermelho, leia a mensagem de erro
4. [ ] Clique no botão **"Entrar com GitHub"**
5. [ ] Você será redirecionado para GitHub
6. [ ] Autorize a aplicação
7. [ ] Voltará logado!

---

## ❌ Se der Erro:

### "Domínio não autorizado"
→ Vá em Firebase > Authentication > Settings > Authorized domains
→ Adicione `localhost` e `127.0.0.1`

### "GitHub Provider não disponível"
→ Verifique se habilitou GitHub em Firebase > Authentication > Sign-in method

### "Pop-up bloqueado"
→ Seu navegador bloqueou. Clique no ícone de bloqueador no navegador e permita pop-ups

### "Client ID/Secret inválido"
→ Copie novamente do GitHub e do Firebase (caracteres são sensíveis)

### "Outro erro?"
→ Abra o Console (F12) e procure pela mensagem de erro vermelha

---

## 🎉 Pronto!

Após completar tudo, o login com GitHub deve funcionar em:
- `http://localhost:8000/login.html`

Boa sorte! 🚀