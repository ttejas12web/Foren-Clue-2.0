const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const script = `
<script>
window.onerror = function(message, source, lineno, colno, error) {
    document.body.innerHTML += '<div style="color:red; background:white; padding:20px; z-index:9999; position:fixed; top:0; left:0; width:100%; height:100vh;">' + 
      '<h3>Global Error</h3>' +
      '<p>' + message + '</p>' +
      '<pre>' + (error ? error.stack : '') + '</pre>' +
    '</div>';
};
</script>
`;

content = content.replace('<head>', '<head>' + script);
fs.writeFileSync('index.html', content);
