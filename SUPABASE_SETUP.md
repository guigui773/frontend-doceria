# Setup do Supabase

O frontend continua no GitHub Pages. A persistencia passa a ficar no Supabase.

## 1. Criar projeto

1. Crie um projeto no Supabase.
2. Em `Authentication > Users`, crie o usuario administrador com e-mail e senha.
3. Em `SQL Editor`, rode o arquivo [supabase/schema.sql](/c:/Users/guijb/Downloads/frontend/supabase/schema.sql:1).

## 2. Preencher configuracao do frontend

Edite [assets/supabase-config.js](/c:/Users/guijb/Downloads/frontend/assets/supabase-config.js:1) com:

```js
(function () {
    window.supabaseConfig = {
        url: "https://SEU-PROJETO.supabase.co",
        anonKey: "SUA_ANON_KEY",
        bucket: "menu-images"
    };
})();
```

Observacao:
- A `anonKey` do Supabase pode ficar no frontend.
- Nao use `service_role` no navegador.

## 3. Publicar no GitHub Pages

1. Commit as alteracoes.
2. Faça push para `main`.
3. Aguarde o GitHub Pages atualizar.

## 4. Como fica o fluxo

- `index.html`: le cardapio do banco e cria pedidos no Supabase.
- `admin.html`: salva configuracoes, itens e imagens no Supabase.
- `orders.html`: le pedidos do banco e atualiza status.
- `login.html`: autentica com Supabase Auth.

## 5. Limitacao importante

As policies atuais permitem:
- leitura publica de cardapio
- criacao publica de pedidos
- leitura publica de pedidos para manter a consulta por numero funcionando sem backend
- edicao de cardapio e status apenas para usuario autenticado

Se quiser endurecer seguranca depois, o melhor proximo passo e criar Edge Functions para consulta de pedido e operacoes administrativas mais sensiveis.
