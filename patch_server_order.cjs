const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// The block to move is from "  // Intercept all HTML requests" down to the end of app.get('*', ...)
// Actually it's easier to just use string replacements.
// 1. Find the start of viteDevServer block
const viteBlockStart = `  if (!isProd) {
    viteDevServer = await createViteServer({`;

const handlerStart = `  // Intercept all HTML requests for social media sharing cards & embed previews`;
const handlerEnd = `      } else {
        next();
      }
    }
  });`;

const startIndex = content.indexOf(handlerStart);
const endIndex = content.indexOf(handlerEnd) + handlerEnd.length;

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find handler block");
    process.exit(1);
}

const handlerBlock = content.substring(startIndex, endIndex);

// Remove the handler block from its original position
let newContent = content.substring(0, startIndex) + content.substring(endIndex);

// Insert it BEFORE viteDevServer block
const viteIndex = newContent.indexOf(viteBlockStart);
if (viteIndex === -1) {
    console.error("Could not find vite block");
    process.exit(1);
}

newContent = newContent.substring(0, viteIndex) + handlerBlock + '\n\n' + newContent.substring(viteIndex);

fs.writeFileSync('server.ts', newContent);
console.log("Moved app.get('*') before Vite and static handlers");
