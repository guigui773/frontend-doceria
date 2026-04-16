# La Mafia dei Dolci Frontend

Site estático com vitrine de produtos, carrinho, acompanhamento de pedidos e páginas administrativas.

O frontend continua compatível com GitHub Pages, mas agora pode usar Firebase para persistência real de:
- cardápio
- pedidos
- login administrativo
- imagens dos produtos

## Estrutura

- `index.html`: cardápio público e envio de pedidos
- `orders.html`: painel de pedidos
- `login.html`: acesso administrativo
- `admin.html`: gestão do cardápio
- `assets/`: estilos, scripts e imagens
- `assets/firebase-config.js`: configuração do Firebase
- `firebase-client.js`: cliente Firebase
- `config.js`: funções de negócio

## Como abrir localmente

Abra `index.html` no navegador ou sirva a pasta com um servidor estático.

## Publicação no GitHub Pages

1. Faça push do projeto para a branch `main`.
2. No GitHub, abra `Settings > Pages`.
3. Em `Build and deployment`, escolha `Deploy from a branch`.
4. Selecione a branch `main` e a pasta `/ (root)`.

## Configuração do Firebase com GitHub OAuth

📚 **Guias Disponíveis:**
- 🚀 [QUICK_START.md](QUICK_START.md) - Setup rápido em 7 minutos
- 📋 [GITHUB_OAUTH_SETUP.md](GITHUB_OAUTH_SETUP.md) - Guia completo e detalhado
- ✅ [verify-setup.html](verify-setup.html) - Página para verificar a integração

### Setup Rápido (7 minutos)

1. **Crie um projeto no [Firebase Console](https://console.firebase.google.com/)**
   - Nome: `la-mafia-dolci`

2. **Crie uma OAuth App no GitHub** ([GitHub Developer Settings](https://github.com/settings/developers))
   - Copie: **Client ID** e **Client Secret**

3. **Configure GitHub OAuth no Firebase**
   - Firebase Console > Authentication > Sign-in method
   - Habilite "GitHub" e cole as credenciais do GitHub
   - Copie a **Authorization callback URL** fornecida

4. **Complete a OAuth App no GitHub**
   - Cole a Authorization callback URL do Firebase

5. **Obtenha credenciais do Firebase**
   - Firebase Console > ⚙️ > Project settings
   - Copie as 6 credenciais do app web

6. **Atualize `assets/firebase-config.js`** com as credenciais

7. **Teste localmente**
   - Execute: `start-server.bat` (Windows) ou `python -m http.server 8000`
   - Abra: [verify-setup.html](verify-setup.html)

### Funcionalidades Habilitadas

Após configurar, você terá:
- ✅ **Login com GitHub** em `/login.html`
- ✅ **Persistência no Firestore** (cardápio, pedidos)
- ✅ **Upload de imagens** no Cloud Storage
- ✅ **Painel administrativo** em `/admin.html`
- ✅ **Acompanhamento de pedidos** em `/orders.html`

### Modo Offline

Sem preencher `assets/firebase-config.js`, o site ainda consegue:
- Abrir o cardápio base (`data/menu.json`)
- Salvar dados localmente no navegador
- Funcionar completamente offline em GitHub Pages
