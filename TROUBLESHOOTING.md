# 🔧 Troubleshooting - Guia de Solução de Problemas

## Problemas Comuns e Soluções

---

## ❌ "Não consigo fazer login com GitHub"

### Erro: "Popup foi bloqueado"
```
Mensagem: "Pop-up foi bloqueado. Verifique suas configurações de navegador."
```

**Solução:**
1. Desabilite adblockers (Adblock Plus, uBlock, etc.)
2. Verifique configurações de pop-ups do navegador
3. Tente em modo anônimo/incógnito
4. Permita pop-ups para `localhost:8000`

---

### Erro: "Domínio não autorizado"
```
Mensagem: "Dominio nao autorizado no Firebase. Configure em Authentication > Settings > Authorized domains."
```

**Solução:**
1. Abra [Firebase Console](https://console.firebase.google.com/)
2. Seu projeto > **Authentication** > aba **Settings** (primeira aba)
3. Role até **"Authorized domains"**
4. Clique **"Add domain"**
5. Se está em desenvolvimento: adicione `localhost`
6. Se está em produção: adicione seu domínio (ex: `seuusuario.github.io`)
7. Clique **"Save"**

---

### Erro: "Client ID inválido" ou "Unauthorized client"
```
Mensagem: "Unauthorized client ou cliente não autorizado"
```

**Solução:**
1. Verifique se copiou corretamente o **Client ID** do GitHub
2. Verifique se a **Authorization callback URL** no GitHub está EXATAMENTE igual à do Firebase
3. Regenere as credenciais se necessário:
   - GitHub: https://github.com/settings/developers > seu app > "Regenerate new client secret"
   - Reconfigure no Firebase

---

### Erro: "Login cancelado pelo usuário"
```
Mensagem: "Login cancelado pelo usuario."
```

**Solução:**
Isto é normal! O usuário clicou em "Cancelar" na página do GitHub.
- Tente novamente
- Certifique-se de estar logado no GitHub antes

---

## ❌ "Firebase não está configurado"

### Erro: "Firebase não configurado"
```
Mensagem: "Firebase nao configurado. Preencha assets/firebase-config.js..."
```

**Solução:**
1. Abra o arquivo: `assets/firebase-config.js`
2. Verifique se tem valores preenchidos
3. Se vazio, siga o [QUICK_START.md](QUICK_START.md)
4. Se tem valores, verifique se:
   - `apiKey` não está vazio
   - `projectId` não está vazio
   - Não há caracteres estranhos ou aspas extras

**Verificar rapidamente:**
- Abra a página [verify-setup.html](verify-setup.html)
- Veja se está marcado ✅ na seção "Configuração do Firebase"

---

## ❌ "Firestore ou Storage não funcionam"

### Erro: "permission-denied" ao salvar dados
```
Mensagem: "Nao foi possivel salvar o cardapio. Permission denied..."
```

**Solução:**
As regras de segurança do Firestore negam acesso. Configure-as:

1. Firebase Console > seu projeto > **Firestore Database**
2. Aba **"Rules"**
3. Copie e cole estas regras:
```javascript
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
    
    // Orders e Admin - apenas autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
4. Clique **"Publish"**

---

### Erro: "Firestore não existe ou está offline"
```
Mensagem: "Nao foi possivel carregar o cardapio. Failed to get document..."
```

**Solução:**
1. Firebase Console > seu projeto > **Firestore Database**
2. Se não existir, clique **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de produção"**
4. Selecione localização (ex: `us-central1`)
5. Clique **"Criar"**

---

## ❌ "Problemas ao iniciar servidor local"

### Erro: "Python não encontrado"
```
Mensagem: "'python' não é reconhecido como comando interno"
```

**Solução:**
1. Instale Python de: https://python.org
2. **IMPORTANTE**: Marque a opção "Add Python to PATH" na instalação
3. Reinicie o terminal
4. Tente novamente: `python -m http.server 8000`

**Alternativa com Node.js:**
```bash
npm install -g http-server
http-server -p 8000
```

---

### Erro: "Porta 8000 já está em uso"
```
Mensagem: "Address already in use" ou "Porta 8000 já está em uso"
```

**Solução:**

**Windows:**
```powershell
# Encontre o processo usando a porta
netstat -ano | findstr :8000

# Mate o processo (substitua PID)
taskkill /PID <PID> /F

# Ou use outra porta
python -m http.server 8001
```

**macOS/Linux:**
```bash
# Encontre o processo
lsof -i :8000

# Mate o processo
kill -9 <PID>

# Ou use outra porta
python3 -m http.server 8001
```

---

## ❌ "Problemas ao carregar páginas"

### Erro: "404 - Arquivo não encontrado"
```
Mensagem: "404 Not Found - página não existe"
```

**Solução:**
1. Certifique-se de que iniciou o servidor **na pasta raiz do projeto**
2. As URLs devem estar assim:
   - Login: `http://localhost:8000/login.html`
   - Verificação: `http://localhost:8000/verify-setup.html`
   - Admin: `http://localhost:8000/admin.html`

---

### Erro: "Scripts não carregam, console vazio"
```
Mensagem: Nada aparece no console, scripts não executam
```

**Solução:**
1. Abra o console do navegador: **F12** ou **Ctrl+Shift+I**
2. Aba **"Console"**
3. Procure por mensagens de erro
4. Se houver CORS error:
   - Certifique-se de usar `http://` (não `file://`)
   - Use um servidor local, não abra arquivos diretamente
5. Se houver erro de Firebase:
   - Verifique `assets/firebase-config.js`

---

## ❌ "Problemas de Autenticação"

### Erro: "Usuário consegue fazer login mas é desconectado após recarregar"
```
Problema: Login funciona, mas ao recarregar a página, desconecta
```

**Solução:**
1. Verifique se está usando `http://` e não `file://`
2. Certifique-se de que o localStorage está habilitado
3. Verifique cookies do navegador:
   - F12 > Application > Cookies
   - Deve ter cookies do domínio

---

### Erro: "Não consegue sair da conta (sign out não funciona)"
```
Problema: Botão de logout não funciona
```

**Solução:**
1. Abra o console: F12
2. Execute manualmente:
   ```javascript
   await window.cardapioStore.signOut();
   window.location.href = './login.html';
   ```
3. Se funcionar, o problema é com o botão de logout no HTML/CSS

---

## ❌ "Problemas ao fazer upload de imagens"

### Erro: "Não foi possível enviar a imagem para o armazenamento"
```
Mensagem: "Nao foi possivel enviar a imagem para o armazenamento"
```

**Solução:**
1. Verifique se Cloud Storage está habilitado:
   - Firebase Console > **Storage**
   - Se não existir, clique **"Começar"**
2. Verifique as regras de segurança:
   - Firebase Console > Storage > **Rules**
   - Cole estas regras:
   ```javascript
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
3. Clique **"Publish"**

---

## 🆘 Preciso de Mais Ajuda?

### Verificação de Setup Completa
Abra a página de verificação:
```
http://localhost:8000/verify-setup.html
```

Ela mostra o status de cada componente.

### Consultando Logs do Firebase
1. Firebase Console > seu projeto
2. Menu > **Functions** > **Logs**
3. Procure por erros ou avisos

### Ativando Debug Mode
No console do navegador, execute:
```javascript
// Para Firebase
firebase.auth().onAuthStateChanged(user => {
    console.log("Auth user:", user);
});

// Para Firestore
db.enableLogging(true);
```

### Checklist de Verificação
- [ ] `assets/firebase-config.js` tem credenciais preenchidas
- [ ] Projeto Firebase foi criado
- [ ] GitHub OAuth App foi criado
- [ ] GitHub está configurado no Firebase
- [ ] Authorization callback URL está correta
- [ ] Domínios autorizados incluem seu domínio
- [ ] Firestore Database foi criado
- [ ] Cloud Storage foi criado
- [ ] Regras de segurança foram atualizadas

### Recursos Úteis
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Firebase Console](https://console.firebase.google.com/)
- [GitHub Developer Settings](https://github.com/settings/developers)

---

## ✅ Tudo Funcionando?

Parabéns! 🎉

Você agora tem:
- ✅ Autenticação com GitHub
- ✅ Banco de dados (Firestore)
- ✅ Armazenamento de imagens (Storage)
- ✅ Painel administrativo seguro

Próximas etapas:
1. Personalize o cardápio em `/admin.html`
2. Configure o nome do restaurante e WhatsApp
3. Publique no GitHub Pages
