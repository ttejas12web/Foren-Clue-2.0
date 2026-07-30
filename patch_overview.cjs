const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldOverview = `<div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <h2 className="text-xl font-heading font-black uppercase tracking-tight mb-4">Workspace Analytics</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl text-center">
                          <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">Dynamic Courses</span>
                          <span className="text-3xl font-heading font-black text-warning">{courses.length}</span>
                        </div>
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl text-center">
                          <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">E-Library Resources</span>
                          <span className="text-3xl font-heading font-black text-warning">{ebooks.length}</span>
                        </div>
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl text-center">
                          <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">Podcast Episodes</span>
                          <span className="text-3xl font-heading font-black text-warning">{podcastEpisodes.length}</span>
                        </div>
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl text-center">
                          <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">Customised Copy Keys</span>
                          <span className="text-3xl font-heading font-black text-warning">{copiedTexts.length}</span>
                        </div>
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl text-center">
                          <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">Certificates Issued</span>
                          <span className="text-3xl font-heading font-black text-warning">{certificates.length}</span>
                        </div>
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl text-center">
                          <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">Employees Manager</span>
                          <span className="text-3xl font-heading font-black text-warning">{adminEmployees.length}</span>
                        </div>
                      </div>
                    </div>`;

const newOverview = `<div className="space-y-6">
                      {/* Advanced Workspace Analytics */}
                      <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                           <LayoutGrid size={120} />
                        </div>
                        <h2 className="text-xl font-heading font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                          <LayoutGrid size={20} className="text-warning" /> Workspace Analytics Overview
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          <div className="bg-base border border-black/5 dark:border-white/5 p-5 rounded-xl flex flex-col justify-between hover:border-warning/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                              <BookOpen size={20} className="text-blue-500" />
                              <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Active</span>
                            </div>
                            <div>
                              <span className="text-3xl font-heading font-black text-text-main">{courses.length}</span>
                              <span className="text-[10px] uppercase tracking-wider text-text-muted block mt-1">Core Courses</span>
                            </div>
                          </div>

                          <div className="bg-base border border-black/5 dark:border-white/5 p-5 rounded-xl flex flex-col justify-between hover:border-warning/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                              <FileText size={20} className="text-emerald-500" />
                              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Resources</span>
                            </div>
                            <div>
                              <span className="text-3xl font-heading font-black text-text-main">{ebooks.length}</span>
                              <span className="text-[10px] uppercase tracking-wider text-text-muted block mt-1">E-Library</span>
                            </div>
                          </div>

                          <div className="bg-base border border-black/5 dark:border-white/5 p-5 rounded-xl flex flex-col justify-between hover:border-warning/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                              <Radio size={20} className="text-purple-500" />
                              <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Media</span>
                            </div>
                            <div>
                              <span className="text-3xl font-heading font-black text-text-main">{podcastEpisodes.length}</span>
                              <span className="text-[10px] uppercase tracking-wider text-text-muted block mt-1">Podcasts</span>
                            </div>
                          </div>

                          <div className="bg-base border border-black/5 dark:border-white/5 p-5 rounded-xl flex flex-col justify-between hover:border-warning/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                              <Award size={20} className="text-amber-500" />
                              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Issued</span>
                            </div>
                            <div>
                              <span className="text-3xl font-heading font-black text-text-main">{certificates.length}</span>
                              <span className="text-[10px] uppercase tracking-wider text-text-muted block mt-1">Certificates</span>
                            </div>
                          </div>

                          <div className="bg-base border border-black/5 dark:border-white/5 p-5 rounded-xl flex flex-col justify-between hover:border-warning/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                              <Users size={20} className="text-rose-500" />
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Staff</span>
                            </div>
                            <div>
                              <span className="text-3xl font-heading font-black text-text-main">{adminEmployees.length}</span>
                              <span className="text-[10px] uppercase tracking-wider text-text-muted block mt-1">Employees</span>
                            </div>
                          </div>

                          <div className="bg-base border border-black/5 dark:border-white/5 p-5 rounded-xl flex flex-col justify-between hover:border-warning/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                              <HelpCircle size={20} className="text-cyan-500" />
                              <span className="text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Tests</span>
                            </div>
                            <div>
                              <span className="text-3xl font-heading font-black text-text-main">{adminQuizzes.length}</span>
                              <span className="text-[10px] uppercase tracking-wider text-text-muted block mt-1">Quizzes</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions Panel */}
                      <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                        <h2 className="text-lg font-heading font-black uppercase tracking-tight mb-4 text-text-main">
                          Dynamic Quick Actions
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <button onClick={() => setActiveTab('courses')} className="px-4 py-4 bg-base border border-black/5 dark:border-white/5 hover:border-warning/50 rounded-xl text-left transition flex flex-col gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <BookOpen size={16} />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-text-main block">New Course</span>
                              <span className="text-[10px] text-text-muted uppercase tracking-widest">Create Module</span>
                            </div>
                          </button>
                          
                          <button onClick={() => setActiveTab('quizzes')} className="px-4 py-4 bg-base border border-black/5 dark:border-white/5 hover:border-warning/50 rounded-xl text-left transition flex flex-col gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <CheckCircle2 size={16} />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-text-main block">New Quiz</span>
                              <span className="text-[10px] text-text-muted uppercase tracking-widest">Setup Challenge</span>
                            </div>
                          </button>
                          
                          <button onClick={() => setActiveTab('ebooks')} className="px-4 py-4 bg-base border border-black/5 dark:border-white/5 hover:border-warning/50 rounded-xl text-left transition flex flex-col gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <FileText size={16} />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-text-main block">Upload E-Book</span>
                              <span className="text-[10px] text-text-muted uppercase tracking-widest">Add Resource</span>
                            </div>
                          </button>
                          
                          <button onClick={() => setActiveTab('podcast')} className="px-4 py-4 bg-base border border-black/5 dark:border-white/5 hover:border-warning/50 rounded-xl text-left transition flex flex-col gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Radio size={16} />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-text-main block">Publish Podcast</span>
                              <span className="text-[10px] text-text-muted uppercase tracking-widest">Release Episode</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>`;

if(content.includes('Workspace Analytics')) {
  content = content.replace(oldOverview, newOverview);
  fs.writeFileSync('src/pages/Admin.tsx', content);
  console.log("Patched Admin.tsx");
} else {
  console.log("Could not find overview section");
}
