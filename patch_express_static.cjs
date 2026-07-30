const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const anchor = `app.use(express.static(buildPath));`;
const newCode = `app.use(express.static(buildPath, { index: false }));`;

if (content.includes(anchor)) {
    content = content.replace(anchor, newCode);
    fs.writeFileSync('server.ts', content);
    console.log('Patched express static');
} else {
    console.log('Anchor not found');
}
