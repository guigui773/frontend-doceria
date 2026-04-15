// Este arquivo é um exemplo de inicialização do Firebase Admin SDK.
// Ele deve rodar em um ambiente Node.js seguro, NÃO no navegador.

var admin = require("firebase-admin");

var serviceAccount = require("./path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
