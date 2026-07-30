const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldHeader = `<h1 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tighter mt-4 text-text-main">
                  Forenclue <span className="text-warning">Control Deck</span>
                </h1>
                <p className="text-sm text-text-muted mt-2 font-mono uppercase tracking-widest">
                  ROOT PRIVILEGES ACTIVE • LEVEL 1 FORENSIC ACCESS
                </p>`;

const newHeader = `<h1 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tighter mt-4 text-text-main flex items-center gap-4">
                  Forenclue <span className="text-warning">Control Deck</span>
                  <span className="hidden sm:inline-block px-3 py-1 bg-warning/10 text-warning text-[12px] font-bold rounded-full animate-pulse tracking-widest border border-warning/20">LIVE STATUS</span>
                </h1>
                <p className="text-sm text-text-muted mt-3 font-mono uppercase tracking-widest flex items-center gap-2">
                  <Lock size={14} className="text-emerald-500" /> ROOT PRIVILEGES ACTIVE • SESSION ID: FC-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                </p>`;

if (content.includes('Forenclue <span className="text-warning">Control Deck</span>')) {
  content = content.replace(oldHeader, newHeader);
  fs.writeFileSync('src/pages/Admin.tsx', content);
  console.log("Patched header in Admin.tsx");
} else {
  console.log("Header not found");
}
