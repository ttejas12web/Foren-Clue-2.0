const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const anchor = `appType: "spa",`;
const newCode = `appType: "custom",`;

if (content.includes(anchor)) {
    content = content.replace(anchor, newCode);
    fs.writeFileSync('server.ts', content);
    console.log('Patched vite server to custom appType');
} else {
    console.log('Anchor not found');
}
