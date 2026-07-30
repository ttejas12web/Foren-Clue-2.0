const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const anchor = `      html = html.replace(/<meta name="description".*?>/i, ''); // Remove existing static description so no conflict`;
const newCode = `      html = html.replace(/<meta name="description".*?>/gi, '');
      html = html.replace(/<meta property="og:.*?".*?>/gi, '');
      html = html.replace(/<meta name="twitter:.*?".*?>/gi, '');
      html = html.replace(/<link rel="image_src".*?>/gi, '');`;

if (content.includes(anchor)) {
    content = content.replace(anchor, newCode);
    fs.writeFileSync('server.ts', content);
    console.log('Patched meta removal');
} else {
    console.log('Anchor not found');
}
