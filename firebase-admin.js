const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

function loadServiceAccount() {
  var inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineJson) {
    try {
      return JSON.parse(inlineJson);
    } catch (error) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON nao eh um JSON valido.");
    }
  }

  var configuredPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!configuredPath) {
    return null;
  }

  var resolvedPath = path.resolve(configuredPath);
  var raw = fs.readFileSync(resolvedPath, "utf8");
  return JSON.parse(raw);
}

if (!admin.apps.length) {
  var serviceAccount = loadServiceAccount();

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }
}

module.exports = admin;
