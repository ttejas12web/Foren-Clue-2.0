const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const anchor = `      html = html.replace('<head>', \`<head>\\n\${metaTags}\`);
      html = html.replace(/<title>.*?<\\/title>/, \`<title>\${title}</title>\`);
      html = html.replace(/<meta name="description".*?>/gi, '');
      html = html.replace(/<meta property="og:.*?".*?>/gi, '');
      html = html.replace(/<meta name="twitter:.*?".*?>/gi, '');
      html = html.replace(/<link rel="image_src".*?>/gi, '');`;

const newCode = `      html = html.replace(/<title>.*?<\\/title>/, \`<title>\${title}</title>\`);
      html = html.replace(/<meta name="description".*?>/gi, '');
      html = html.replace(/<meta property="og:.*?".*?>/gi, '');
      html = html.replace(/<meta name="twitter:.*?".*?>/gi, '');
      html = html.replace(/<link rel="image_src".*?>/gi, '');
      
      html = html.replace('<head>', \`<head>\\n\${metaTags}\`);`;

if (content.includes(anchor)) {
    content = content.replace(anchor, newCode);
    fs.writeFileSync('server.ts', content);
    console.log('Patched replace order');
} else {
    console.log('Anchor not found');
}
