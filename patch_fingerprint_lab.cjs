const fs = require('fs');
let content = fs.readFileSync('src/pages/FingerprintLab.tsx', 'utf8');
content = content.replace(/\\\\/g, ''); // Not a good idea, let's just rewrite the whole file using node.js instead of bash heredoc directly.
