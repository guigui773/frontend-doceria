// Test script for Firebase Admin SDK
const admin = require("./firebase-admin");

async function testFirebaseAdmin() {
  try {
    console.log("Initializing Firebase Admin SDK...");

    const db = admin.firestore();
    console.log("Firestore initialized successfully.");

    const collections = await db.listCollections();
    console.log("Available collections:", collections.map(function (col) { return col.id; }));

    const snapshot = await db.collection("menu_items").limit(5).get();
    console.log("Found", snapshot.size, "menu items in sample read.");
    snapshot.forEach(function (doc) {
      console.log("Menu item:", doc.id, doc.data());
    });

    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Error during test:", error.message);
    console.error("Hint: set FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS with your JSON key path.");
  }
}

testFirebaseAdmin();
