const html = `<!doctype html>
<html lang="en">
  <head>
    <meta property="og:title" content="ForenClue | Forensic EdTech Mastery" />
    <meta name="twitter:title" content="ForenClue | Forensic EdTech Mastery" />
    <meta name="description" content="ForenClue - India's premier forensic science edtech platform. Master forensic analysis, cybersecurity, and investigations." />
  </head>
</html>`;

const metaTags = `
    <!-- Dynamic social media preview tags -->
    <meta name="description" content="TEST DESC" />
    <meta property="og:title" content="TEST TITLE" />
`;

let result = html;
result = result.replace(/<title>.*?<\/title>/, `<title>TEST TITLE</title>`);
result = result.replace(/<meta name="description".*?>/gi, '');
result = result.replace(/<meta property="og:.*?".*?>/gi, '');
result = result.replace(/<meta name="twitter:.*?".*?>/gi, '');
result = result.replace(/<link rel="image_src".*?>/gi, '');

result = result.replace('<head>', `<head>\n${metaTags}`);

console.log(result);
