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

## Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Habilite Authentication com GitHub provider
3. Habilite Firestore Database
4. Habilite Storage
5. Edite `assets/firebase-config.js` com suas credenciais do Firebase

### Configuração do GitHub OAuth no Firebase

1. No Firebase Console > Authentication > Sign-in method
2. Habilite "GitHub"
3. Crie uma OAuth App no GitHub:
   - Settings > Developer settings > OAuth Apps
   - **Homepage URL**: `http://localhost:8000` (desenvolvimento)
   - **Authorization callback URL**: `https://YOUR_PROJECT.firebaseapp.com/__/auth/handler`
4. Cole Client ID e Client Secret no Firebase

Sem preencher `assets/firebase-config.js`, o site ainda consegue abrir o cardápio base, mas a persistência continua limitada ao navegador local.
