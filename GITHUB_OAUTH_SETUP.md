# 🔐 Integração GitHub OAuth com Firebase - Guia Completo

Este guia vai te levar passo a passo para configurar autenticação com GitHub no seu aplicativo usando Firebase.

---

## 📋 Pré-requisitos

- Uma conta no GitHub (https://github.com)
- Uma conta no Firebase (https://console.firebase.google.com)

---

## ✅ PASSO 1: Criar Projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique **"Criar um projeto"** ou **"Add project"**
3. Preencha:
   - **Project name**: `la-mafia-dolci` (ou seu nome preferido)
   - Desabilite "Google Analytics" (opcional)
4. Clique **"Criar projeto"** e aguarde a criação (2-3 minutos)

---

## ✅ PASSO 2: Habilitar Firestore Database

1. No menu lateral > **"Firestore Database"**
2. Clique **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de produção"**
4. Selecione localização: **"us-central1"** (ou mais próxima)
5. Clique **"Criar"**

---

## ✅ PASSO 3: Habilitar Cloud Storage

1. No menu lateral > **"Storage"**
2. Clique **"Começar"**
3. Escolha **"Iniciar no modo de produção"**
4. Confirme a mesma localização do Firestore
5. Clique **"Criar"**

---

## ✅ PASSO 4: Criar OAuth App no GitHub

1. Acesse [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Clique **"New OAuth App"**
3. Preencha EXATAMENTE:
   ```
   Application name: La Mafia dei Dolci Admin
   Homepage URL: http://localhost:8000
   Authorization callback URL: [DEIXE EM BRANCO POR ENQUANTO]
   Description: (opcional)
   ```
4. Clique **"Register application"**
5. **COPIE E GUARDE:**
   - **Client ID**: (algo como `abc123def456...`)
   - **Client Secret**: (algo como `xyz789abc...`)

⚠️ **IMPORTANTE**: Você precisará dessas credenciais nos próximos passos!

---

## ✅ PASSO 5: Configurar GitHub OAuth no Firebase

1. Volte para [Firebase Console](https://console.firebase.google.com/)
2. Clique no seu projeto `la-mafia-dolci`
3. Menu lateral > **"Authentication"**
4. Aba **"Sign-in method"** (segunda aba)
5. Procure **"GitHub"** na lista de provedores
6. Clique nele para abrir o painel de configuração
7. Clique no **toggle azul** para habilitar
8. Preencha:
   - **GitHub Client ID**: (cole do GitHub)
   - **GitHub Client Secret**: (cole do GitHub)
9. Clique **"Save"**
10. **COPIE a Authorization callback URL** que aparece (será algo como: `https://la-mafia-dolci.firebaseapp.com/__/auth/handler`)

---

## ✅ PASSO 6: Completar GitHub OAuth App

1. Volte para [GitHub OAuth Apps](https://github.com/settings/developers)
2. Clique no seu app **"La Mafia dei Dolci Admin"**
3. Clique no botão **"Edit"** (canto superior direito)
4. Edite o campo **"Authorization callback URL"**
5. Cole a URL do Firebase (passo anterior)
6. Clique **"Update application"**

---

## ✅ PASSO 7: Obter Credenciais do Firebase

1. Volte ao Firebase Console
2. Clique no ícone ⚙️ **engrenagem** (canto superior direito)
3. Clique **"Project settings"**
4. Role até a seção **"Seus apps"**
5. Se não houver um app web, clique **"</>"** para adicionar
6. Preencha o nome: **"La Mafia Web App"**
7. **NÃO marque** "Também configure o Firebase Hosting"
8. Clique **"Registrar app"**
9. Você verá um objeto JavaScript com as credenciais:
   ```js
   {
     apiKey: "AIzaSy...",
     authDomain: "la-mafia-dolci.firebaseapp.com",
     projectId: "la-mafia-dolci",
     storageBucket: "la-mafia-dolci.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:..."
   }
   ```
10. **COPIE TODAS ESSAS INFORMAÇÕES**

---

## ✅ PASSO 8: Configurar Domínios Autorizados

1. No Firebase Console > **"Authentication"**
2. Clique na aba **"Settings"** (primeira aba no topo)
3. Role até **"Authorized domains"**
4. Clique **"Add domain"**
5. Adicione: **`localhost`** (para desenvolvimento)
6. Após teste bem-sucedido, adicione também:
   - **`seuusuario.github.io`** (seu GitHub Pages)
   - **`seudominio.com`** (se tiver domínio customizado)

---

## ✅ PASSO 9: Atualizar Configuração do Projeto

1. Abra o arquivo: `assets/firebase-config.js`
2. Substitua com as credenciais do Firebase (passo 7):
   ```js
   // Firebase Configuration
   (function () {
       window.firebaseConfig = {
           apiKey: "AIzaSy_XYZ...",  // Do Firebase
           authDomain: "la-mafia-dolci.firebaseapp.com",  // Do Firebase
           projectId: "la-mafia-dolci",  // Do Firebase
           storageBucket: "la-mafia-dolci.appspot.com",  // Do Firebase
           messagingSenderId: "1234567890",  // Do Firebase
           appId: "1:1234567890:web:..."  // Do Firebase
       };
   })();
   ```
3. **SALVE O ARQUIVO**

---

## ✅ PASSO 10: Testar Localmente

1. Abra um terminal na pasta do projeto
2. Inicie um servidor local:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Ou com Node.js (se tiver http-server instalado)
   npx http-server -p 8000
   ```
3. Abra no navegador: `http://localhost:8000/login.html`
4. Clique no botão **"Entrar com GitHub"**
5. Você deve ser redirecionado para a página de autenticação do GitHub
6. Autorize o acesso ao aplicativo
7. Após sucesso, deve ser redirecionado para `admin.html`

---

## ✅ PASSO 11: Publicar no GitHub Pages (Opcional)

Se quiser usar em produção no GitHub Pages:

1. Edite `assets/firebase-config.js` novamente:
   - A configuração do Firebase é a mesma
   - Apenas certifique-se de que o domínio `seuusuario.github.io` está autorizado no Firebase (passo 8)

2. No Firebase Console > **"Authentication"** > **"Settings"**:
   - Adicione `seuusuario.github.io` em "Authorized domains"

3. Faça push do projeto para o GitHub
4. Configure GitHub Pages nas configurações do repositório

---

## 🔒 Configurando Firestore Security Rules

Para proteger sua base de dados, adicione estas regras:

1. Firebase Console > **"Firestore Database"**
2. Aba **"Rules"**
3. Cole:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Menu items - leitura pública
       match /menu_items/{document=**} {
         allow read: if true;
       }
       
       // Settings - leitura pública
       match /settings/{document=**} {
         allow read: if true;
       }
       
       // Orders - apenas leitura/escrita para autenticados
       match /orders/{document=**} {
         allow read, create: if request.auth != null;
         allow update, delete: if request.auth != null;
         allow read: if request.auth.uid == resource.data.owner_uid;
       }
       
       // Admin - apenas GitHub autenticados
       match /admin/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
4. Clique **"Publish"**

---

## 🐛 Troubleshooting

### Erro: "Domínio não autorizado"
- Firebase Console > Authentication > Settings > Authorized domains
- Verifique se seu domínio está autorizado

### Erro: "Pop-up bloqueado"
- Desabilite adblocker no seu navegador
- Verifique as configurações de pop-ups do navegador

### Erro: "Client ID ou Client Secret incorreto"
- Verifique se copiou corretamente do GitHub
- Certifique-se de que o app no GitHub está ainda ativo

### Não consegue fazer login
- Verifique se GitHub OAuth App está com Authorization callback URL correta
- Teste primeiro em `http://localhost:8000`

---

## 📚 Recursos Úteis

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Firebase Console](https://console.firebase.google.com)
- [GitHub Developer Settings](https://github.com/settings/developers)

---

## ✨ Pronto!

Após completar todos os passos, seu aplicativo estará pronto para:
- ✅ Autenticação com GitHub
- ✅ Persistência de dados no Firestore
- ✅ Upload de imagens no Storage
- ✅ Acesso administrativo seguro
