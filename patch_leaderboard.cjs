const fs = require('fs');

let content = fs.readFileSync('src/components/quiz/LeaderboardPodium.tsx', 'utf8');

content = content.replace(/<p className="text-xs text-text-muted mb-4 line-clamp-1">\s*\{top2\.userEmail\}\s*<\/p>/g, '');
content = content.replace(/<p className="text-xs text-amber-400\/80 mb-4 line-clamp-1 font-medium">\s*\{top1\.userEmail\}\s*<\/p>/g, '');
content = content.replace(/<p className="text-xs text-text-muted mb-4 line-clamp-1">\s*\{top3\.userEmail\}\s*<\/p>/g, '');
content = content.replace(/<div className="text-xs text-text-muted truncate">\s*\{entry\.userEmail\}\s*<\/div>/g, '');

fs.writeFileSync('src/components/quiz/LeaderboardPodium.tsx', content);
console.log("Patched LeaderboardPodium.tsx");
