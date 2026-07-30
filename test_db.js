import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
admin.initializeApp({ projectId: firebaseConfig.projectId });
const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId || undefined);
async function run() {
  console.log("Testing DB ID:", firebaseConfig.firestoreDatabaseId);
  const doc = await db.collection('quizzes').doc('weekly-challenge-1').get();
  console.log("Exists:", doc.exists);
  if (doc.exists) console.log(doc.data().title);
}
run().catch(console.error);
