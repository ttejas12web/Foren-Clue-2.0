const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Insert helper
const helperStr = `
const getLocalDatetimeString = (dateObj: Date | string | number) => {
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
};
`;

if (!content.includes('getLocalDatetimeString')) {
  content = content.replace('export default function Admin() {', helperStr + '\nexport default function Admin() {');
}

// Replace occurrences
content = content.replace(/new Date\(Date.now\(\) \+ 86400000\)\.toISOString\(\)\.slice\(0, 16\)/g, 'getLocalDatetimeString(Date.now() + 86400000)');
content = content.replace(/q\.scheduledStartTime \? new Date\(q\.scheduledStartTime\)\.toISOString\(\)\.slice\(0, 16\) : ''/g, "q.scheduledStartTime ? getLocalDatetimeString(q.scheduledStartTime) : ''");

// In handleAdminSaveQuiz, set to '' if empty
const saveRegex = /if \(newQuizForm\.scheduledStartTime\) \{\s*payload\.scheduledStartTime = new Date\(newQuizForm\.scheduledStartTime\)\.toISOString\(\);\s*\}/;
content = content.replace(saveRegex, `if (newQuizForm.scheduledStartTime) {
        payload.scheduledStartTime = new Date(newQuizForm.scheduledStartTime).toISOString();
      } else {
        payload.scheduledStartTime = '';
      }`);

fs.writeFileSync('src/pages/Admin.tsx', content);
console.log("Patched Admin.tsx");
