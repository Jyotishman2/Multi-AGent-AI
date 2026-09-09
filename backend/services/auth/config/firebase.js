import { cert, initializeApp } from "firebase-admin/app";
import fs from "fs";

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  "./serviceAccountKey.json";

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

export const app = initializeApp({
  credential: cert(serviceAccount),
});