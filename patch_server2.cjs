const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const anchorStart = `    try {
      let html = fs.readFileSync(indexPath, 'utf-8');
      
      let title = 'ForenClue | Forensic EdTech Mastery';
      let summary = "ForenClue - India's premier forensic science edtech platform. Master forensic analysis, cybersecurity, and investigations.";
      let image = '/forenclue_og_banner.jpg';
      
      const fullUrl = \`https://\${req.get('host')}\${req.originalUrl}\`;

      try {
        if (req.path === '/cases' && req.query.case) {`;
const anchorEnd = `        else if (req.path === '/terms') {
          title = 'Terms of Service | ForenClue';
          summary = 'Review user terms, educational guidelines, certificate code of conduct, and enrollment conditions for ForenClue.';
        }
      } catch (dbError) {
        console.error("Error fetching preview metadata:", dbError);
      }`;

const newBlock = `      try {
        if (req.path === '/cases') {
          if (req.query.case) {
            try {
              const dbAdmin = getDbAdmin();
              const caseDoc = await dbAdmin.collection('cases').doc(req.query.case).get();
              if (caseDoc.exists) {
                const data = caseDoc.data();
                if (data) {
                  title = data.title ? \`\${data.title} | ForenClue Archive\` : title;
                  summary = data.summary || summary;
                  if (data.image) image = data.image;
                }
              }
            } catch(e) { console.error('cases db error', e); }
          } else {
            title = 'Forensic Case Studies Archive | ForenClue';
            summary = 'Explore real-world forensic science case studies, crime scene investigations, and analytical breakdowns.';
          }
        } 
        else if (req.path === '/courses') {
          if (req.query.id) {
            const courseId = Number(req.query.id);
            try {
              const dbAdmin = getDbAdmin();
              const courseDocs = await dbAdmin.collection('courses').where('id', '==', courseId).get();
              if (!courseDocs.empty) {
                  const data = courseDocs.docs[0].data();
                  if (data) {
                    title = data.title ? \`\${data.title} | ForenClue\` : title;
                    summary = data.description || summary;
                    if (data.thumbnail) image = data.thumbnail;
                    else if (data.image) image = data.image;
                  }
              } else {
                 throw new Error("not found in db");
              }
            } catch (e) {
               try {
                 const course = COURSES.find(c => c.id === courseId);
                 if (course) {
                   title = course.title ? \`\${course.title} | ForenClue\` : title;
                   summary = course.description || summary;
                   if (course.thumbnail) image = course.thumbnail;
                 }
               } catch (fallbackErr) {
                 console.warn("Could not load dynamic constants fallback", fallbackErr);
               }
            }
          } else {
            title = 'Forensic Science Courses & Masterclasses | ForenClue';
            summary = 'Browse our comprehensive list of forensic science courses, cybersecurity training, and expert-led masterclasses.';
          }
        }
        else if (req.path === '/quizzes') {
          title = 'Forensic Quizzes & Weekly Challenges | ForenClue';
          summary = 'Participate in weekly forensic science quiz challenges, test your knowledge, compete on live leaderboards, and claim top 10 rankings!';
        }
        else if (req.path.startsWith('/quizzes/')) {
          const quizId = req.path.split('/')[2];
          if (quizId && quizId !== 'leaderboard') {
            try {
              const dbAdmin = getDbAdmin();
              const quizDoc = await dbAdmin.collection('quizzes').doc(quizId).get();
              if (quizDoc.exists) {
                const data = quizDoc.data();
                if (data) {
                  title = data.title ? \`\${data.title} | ForenClue Quiz\` : title;
                  summary = data.description || summary;
                }
              } else {
                // Check sample quizzes fallback if DB is empty or fails
                if (quizId.includes('weekly-challenge-1')) {
                  title = 'Crime Scene Investigation Protocol | Weekly Quiz Challenge';
                  summary = 'Test your knowledge on crime scene securing, evidence collection protocols, and chain of custody.';
                } else if (quizId.includes('weekly-challenge-2')) {
                  title = 'Digital Forensics & Malware Analysis | Weekly Quiz Challenge';
                  summary = 'Assess your expertise in digital forensics, volatile memory analysis, and malware identification.';
                }
              }
            } catch(e) {
               console.error('quiz db error', e);
               if (quizId.includes('weekly-challenge-1')) {
                  title = 'Crime Scene Investigation Protocol | Weekly Quiz Challenge';
                  summary = 'Test your knowledge on crime scene securing, evidence collection protocols, and chain of custody.';
               } else if (quizId.includes('weekly-challenge-2')) {
                  title = 'Digital Forensics & Malware Analysis | Weekly Quiz Challenge';
                  summary = 'Assess your expertise in digital forensics, volatile memory analysis, and malware identification.';
               }
            }
          }
        }
        else if (req.path === '/about') {
          title = 'About Our Mission & Team | ForenClue';
          summary = 'Meet the expert leaders, academic counselors, and founders behind ForenClue. Discover our mission to transform forensic science edtech and cybersecurity training.';
        }
        else if (req.path === '/careers') {
          title = 'Careers & Internships | ForenClue';
          summary = 'Join the ForenClue team. Explore career opportunities, hands-on forensic science internships, research roles, and advisory board positions.';
        }
        else if (req.path === '/services') {
          title = 'Professional Forensic Services | ForenClue';
          summary = 'Inquire about corporate and personal forensic investigation services. Professional consultancy in cyber forensics, criminal analysis, and verification studies.';
        }
        else if (req.path === '/ebooks') {
          title = 'ForenClue E-Library & Handbooks';
          summary = 'Browse verified scientific forensic handbooks, physical crime scene protocols, and digital study reference manuals in the ForenClue secure E-Library.';
        }
        else if (req.path === '/podcast') {
          title = 'Forensic Talk Podcast | ForenClue';
          summary = 'Listen to ForenClue Forensic Talk. Dynamic, deep-dive discussions with veteran crime scene experts, cybersecurity directors, and legal counselors.';
        }
        else if (req.path === '/webinar') {
          title = 'Live Forensic Science Masterclasses & Webinars';
          summary = 'Register for upcoming high-impact live webinars hosted by top forensic experts. Learn digital investigations, trace evidence analytics, and earn certification.';
        }
        else if (req.path === '/community') {
          title = 'ForenClue Forensic Community Hub';
          summary = "Engage in India's premier forensic science and research peer community. Share academic doubts, deliberate active case logs, and network with forensic analysts.";
        }
        else if (req.path === '/contact') {
          title = 'Contact Forensic Experts | ForenClue Support';
          summary = 'Get in touch with ForenClue administrative directors, student support coordinators, or business partnership divisions for your educational queries.';
        }
        else if (req.path === '/certificate') {
          title = 'Instant Certificate Verification Portal | ForenClue';
          summary = 'Instantly authenticate and verify official academic credentials, masterclass badges, and course completion certificates issued by the ForenClue Board.';
        }
        else if (req.path === '/employees') {
          title = 'ForenClue Employee Verification Board';
          summary = 'ForenClue secure Employee Verification Portal. Search active duty badges, credentials, and digital cryptographic ID cards.';
          image = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgKXJQb5UkVJcbG4a0rTFiNdhEa1wfFDfbew92r5tR1XXbYUkW7AbdMR_MSFwgCJg1zsDwpJX3jVns0as8FzPWrcK_SqiR9c-ah5jHmHksFm2AmiHtC46umM02LTfmeBBoxOjTRJnAzl6gW1dLY0AmDpDdQw2tl1L2D0R_hFonlFjnoNf22TNpbh9Hz9Kw/s1884/Screenshot%202026-07-20%20at%2012.06.52%E2%80%AFAM.png';
        }
        else if (req.path === '/privacy') {
          title = 'Privacy Policy | ForenClue';
          summary = 'Understand how ForenClue collects, stores, and protects student data, examination records, and transaction security.';
        }
        else if (req.path === '/terms') {
          title = 'Terms of Service | ForenClue';
          summary = 'Review user terms, educational guidelines, certificate code of conduct, and enrollment conditions for ForenClue.';
        }
      } catch (dbError) {
        console.error("Error fetching preview metadata:", dbError);
      }`;

const startIdx = content.indexOf(`      try {\n        if (req.path === '/cases' && req.query.case) {`);
const endIdx = content.indexOf(`      } catch (dbError) {\n        console.error("Error fetching preview metadata:", dbError);\n      }`);

if (startIdx !== -1 && endIdx !== -1) {
    const fullEndIdx = endIdx + `      } catch (dbError) {\n        console.error("Error fetching preview metadata:", dbError);\n      }`.length;
    content = content.substring(0, startIdx) + newBlock + content.substring(fullEndIdx);
    fs.writeFileSync('server.ts', content);
    console.log('Patched server.ts successfully');
} else {
    console.log('Anchor not found');
}
