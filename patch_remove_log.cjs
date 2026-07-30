const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace('    console.log("INCOMING REQUEST TO HTML HANDLER:", req.path);\n', '');
content = content.replace('    console.log("INCOMING REQUEST TO HTML HANDLER:", req.path);', '');
fs.writeFileSync('server.ts', content);
