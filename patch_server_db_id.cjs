const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const anchor = `_dbAdmin = getFirestore();`;
const newCode = `_dbAdmin = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId || undefined);`;

if (content.includes(anchor)) {
    content = content.replace(anchor, newCode);
    fs.writeFileSync('server.ts', content);
    console.log('Patched server.ts getFirestore successfully');
} else {
    console.log('Anchor not found');
}
