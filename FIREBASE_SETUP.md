# Setup do Firebase

O frontend agora usa Firebase em vez do Supabase para persistência.

## 1. Criar projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique "Criar um projeto" ou "Add project"
3. Dê um nome ao projeto (ex: "la-mafia-dolci")
4. Habilite Google Analytics se quiser (opcional)
5. Clique "Criar projeto"

## 2. Configurar Authentication

1. No menu lateral, clique em "Authentication"
2. Vá para "Sign-in method"
3. Habilite "GitHub":
   - Clique em "GitHub" na lista
   - Toggle para habilitar
   - Preencha:
     - **Client ID**: (ver passo 3)
     - **Client secret**: (ver passo 3)
   - **Authorization callback URL**: será preenchida automaticamente
4. Clique "Save"

## 3. Criar OAuth App no GitHub

1. Vá para [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Clique "New OAuth App"
3. Preencha:
   - **Application name**: "La Mafia dei Dolci Admin"
   - **Homepage URL**: `http://localhost:8000` (para desenvolvimento)
   - **Authorization callback URL**: copie do Firebase (formato: `https://SEU_PROJETO.firebaseapp.com/__/auth/handler`)
4. Clique "Register application"
5. Copie o **Client ID** e **Client Secret**

## 4. Configurar Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique "Criar banco de dados"
3. Escolha "Iniciar no modo de produção" (regras de segurança serão configuradas depois)
4. Selecione uma localização (ex: us-central)

## 5. Configurar Storage

1. No menu lateral, clique em "Storage"
2. Clique "Começar"
3. Escolha "Iniciar no modo de produção"
4. Selecione uma localização igual ao Firestore

## 6. Obter credenciais do Firebase

1. Clique no ícone de engrenagem > "Configurações do projeto"
2. Role para baixo até "Seus apps"
3. Clique no ícone de web "</>" para adicionar um app web
4. Dê um nome (ex: "La Mafia Web App")
5. **IMPORTANTE**: Não marque "Também configure o Firebase Hosting"
6. Copie as credenciais que aparecem

## 7. Preencher configuração no projeto

Edite `assets/firebase-config.js`:

```js
(function () {
    window.firebaseConfig = {
        apiKey: "SUA_API_KEY_AQUI",
        authDomain: "SEU_PROJETO.firebaseapp.com",
        projectId: "SEU_PROJETO",
        storageBucket: "SEU_PROJETO.appspot.com",
        messagingSenderId: "SEU_SENDER_ID",
        appId: "SEU_APP_ID"
    };
})();
```

## 8. Configurar regras de segurança

### Firestore Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Menu items - public read, authenticated write
    match /menu_items/{item} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Settings - public read, authenticated write
    match /settings/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Orders - public read (for lookup), authenticated write
    match /orders/{order} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Order items - same as orders
    match /orders/{order}/items/{item} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /menu/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 9. Testar

1. Preencha as credenciais em `assets/firebase-config.js`
2. Abra `http://localhost:8000/login.html`
3. Teste login com GitHub
4. Acesse admin e salve um item do cardápio
5. Verifique se aparece no cardápio público

## Limitações do plano gratuito

- **Authentication**: Ilimitado
- **Firestore**: 1GB armazenamento, 50K leituras/dia
- **Storage**: 5GB, 50K downloads/dia
- **Hosting**: 10GB/mês (se usar Firebase Hosting)

Para produção, considere upgrade se precisar de mais recursos.