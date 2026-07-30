const req = { path: '/quizzes/weekly-challenge-1' };
let title = "GENERIC TITLE";
if (req.path.startsWith('/quizzes/')) {
    const quizId = req.path.split('/')[2];
    if (quizId && quizId !== 'leaderboard') {
        if (quizId.includes('weekly-challenge-1')) {
            title = 'Crime Scene Investigation Protocol | Weekly Quiz Challenge';
        }
    }
}
console.log(title);
