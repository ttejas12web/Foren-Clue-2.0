const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const anchor = `                  title = 'Crime Scene Investigation Protocol | Weekly Quiz Challenge';`;
const newCode = `                  console.log("MATCHED WEEKLY CHALLENGE 1!!!");
                  title = 'Crime Scene Investigation Protocol | Weekly Quiz Challenge';`;

if (content.includes(anchor)) {
    content = content.replace(anchor, newCode);
    fs.writeFileSync('server.ts', content);
    console.log('Patched console log into weekly challenge');
} else {
    console.log('Anchor not found');
}
