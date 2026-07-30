const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const anchorStart = `      html = html.replace(/<title>.*?<\\/title>/, \`<title>\${title}</title>\`);`;
const anchorEnd = `      if (!isProd && viteDevServer) {
        html = await viteDevServer.transformIndexHtml(req.originalUrl, html);
      }`;

const startIdx = content.indexOf(anchorStart);
const endIdx = content.indexOf(anchorEnd) + anchorEnd.length;

if (startIdx === -1 || content.indexOf(anchorEnd) === -1) {
    console.error("Could not find block");
    process.exit(1);
}

const replacerBlock = content.substring(startIdx, content.indexOf(anchorEnd));
const transformBlock = anchorEnd;

const newBlock = transformBlock + '\n\n' + replacerBlock;

content = content.substring(0, startIdx) + newBlock + content.substring(endIdx);

fs.writeFileSync('server.ts', content);
console.log("Moved replace AFTER transformIndexHtml");
