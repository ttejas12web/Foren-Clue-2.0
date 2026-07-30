const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const anchor = `app.get('*', async (req, res, next) => {`;
const newCode = `app.get('*', async (req, res, next) => {
    console.log("INCOMING REQUEST TO HTML HANDLER:", req.path);`;

if (content.includes(anchor)) {
    content = content.replace(anchor, newCode);
    fs.writeFileSync('server.ts', content);
    console.log('Patched with console.log');
}
