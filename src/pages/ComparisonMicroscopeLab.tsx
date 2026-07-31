import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { ComparisonMicroscope3D } from '@/components/laboratory/ComparisonMicroscope3D';
import { SEO } from '@/components/layout/SEO';
import { 
  Columns3, 
  RotateCw, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Lightbulb, 
  Link2, 
  Unlink2, 
  Layers,
  Award,
  BookOpen,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// High-resolution realistic forensic comparison image texture representations
const COMPARISON_CASES = [
  {
    id: 'case_bullet',
    category: 'ballistics' as const,
    title: 'Fired Bullet Land Striations',
    caseNumber: 'FC-BALLISTICS-8819',
    evidenceLabel: 'Ev. #A (Crime Scene 9mm)',
    controlLabel: 'Control #B (Test Fired Glock 19)',
    description: 'Compare land and groove microscopic striations of a bullet recovered from the crime scene against a test-fired bullet from suspect firearm.',
    evidenceImg: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800',
    controlImg: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=800',
    matchAngle: 45,
    matchType: 'MATCH',
    evidenceDetails: '9mm Luger, 6-Land Right Twist, Deep firing pin drag marks',
    rationale: 'Positive Match! Consecutive matching striae (CMS) along land impress #3 confirm identical rifling barrel origin.'
  },
  {
    id: 'case_cartridge',
    category: 'cartridge' as const,
    title: 'Cartridge Breechface Marks',
    caseNumber: 'FC-CASING-4012',
    evidenceLabel: 'Ev. #A (Scene Casing)',
    controlLabel: 'Control #B (Test Casing)',
    description: 'Examine hemispherical firing pin impression and parallel breechface striations on the primer cup.',
    evidenceImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    controlImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    matchAngle: 120,
    matchType: 'MATCH',
    evidenceDetails: '.45 ACP Brass Casing, Elliptical firing pin impression',
    rationale: 'Positive Match! Microscopic shearing toolmarks on the primer cup align with breechface machining marks.'
  },
  {
    id: 'case_fiber',
    category: 'fiber' as const,
    title: 'Textile Fiber Morphologies',
    caseNumber: 'FC-TRACE-9931',
    evidenceLabel: 'Ev. #A (Fingernail Scraping)',
    controlLabel: 'Control #B (Suspect Coat)',
    description: 'Analyze cross-section, pigment distribution, and twist pattern of a single crimson synthetic fiber.',
    evidenceImg: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800',
    controlImg: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800',
    matchAngle: 0,
    matchType: 'MATCH',
    evidenceDetails: 'Trilobal Nylon 6,6, Crimson azo dye batch #404',
    rationale: 'Positive Match! Identical refractive index, lumen diameter, and dye void distribution under cross-polar illumination.'
  },
  {
    id: 'case_toolmark',
    category: 'toolmark' as const,
    title: 'Lock Shear Toolmarks',
    caseNumber: 'FC-TOOL-3310',
    evidenceLabel: 'Ev. #A (Door Lock Hasp)',
    controlLabel: 'Control #B (Recovered Pliers)',
    description: 'Examine striation spacing left on a severed brass padlock latch against test impressions.',
    evidenceImg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    controlImg: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    matchAngle: 90,
    matchType: 'ELIMINATION',
    evidenceDetails: 'Extruded brass latch, 12 major ridge lines',
    rationale: 'Elimination! Tooth pitch frequency and blade imperfection angles do not match standard jaw profile.'
  }
];

const OBJECTIVES = [4, 10, 40, 100];

export default function ComparisonMicroscopeLab() {
  const [selectedCase, setSelectedCase] = useState(COMPARISON_CASES[0]);

  // Microscope States
  const [objective, setObjective] = useState(10);
  const [lightIntensity, setLightIntensity] = useState(70);
  const [leftFocus, setLeftFocus] = useState(50);
  const [rightFocus, setRightFocus] = useState(50);
  const [leftRotation, setLeftRotation] = useState(0);
  const [rightRotation, setRightRotation] = useState(0);
  const [leftStageX, setLeftStageX] = useState(50);
  const [leftStageY, setLeftStageY] = useState(50);
  const [rightStageX, setRightStageX] = useState(50);
  const [rightStageY, setRightStageY] = useState(50);

  // Sync state
  const [isSynced, setIsSynced] = useState(false);

  // View Options
  const [splitPosition, setSplitPosition] = useState(50); // 0% to 100%
  const [isSuperimposed, setIsSuperimposed] = useState(false);
  const [superimposeOpacity, setSuperimposeOpacity] = useState(50);

  // Assessment State
  const [userConclusion, setUserConclusion] = useState<'MATCH' | 'ELIMINATION' | 'INCONCLUSIVE' | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Forensic Optics & Advanced Controls
  const [obliqueAngle, setObliqueAngle] = useState(45); // 15° to 75° grazing incident angle
  const [showMicrometer, setShowMicrometer] = useState(true);
  const [plmPolarized, setPlmPolarized] = useState(false);
  const [activePins, setActivePins] = useState<{ x: number; y: number; label: string }[]>([]);

  // Calculate live alignment angle difference and CMS match score
  const angleDiff = Math.abs((rightRotation - leftRotation) - selectedCase.matchAngle) % 360;
  const matchPercentage = selectedCase.matchType === 'MATCH'
    ? Math.max(0, Math.round(100 - angleDiff * 2.5))
    : Math.max(0, Math.round(15 + Math.sin(angleDiff * 0.1) * 10));

  // Handle Rotation Changes with optional sync
  const handleLeftRotationChange = (val: number) => {
    setLeftRotation(val);
    if (isSynced) {
      setRightRotation(val);
    }
  };

  const handleRightRotationChange = (val: number) => {
    setRightRotation(val);
    if (isSynced) {
      setLeftRotation(val);
    }
  };

  // Math for Eyepiece Focus
  const leftBlur = Math.abs(leftFocus - 50) * (objective / 10) * 0.4;
  const rightBlur = Math.abs(rightFocus - 50) * (objective / 10) * 0.4;
  const scaleMultiplier = objective / 4;
  const brightness = Math.max(0.15, lightIntensity / 100);

  const handleVerifyConclusion = (conclusion: 'MATCH' | 'ELIMINATION' | 'INCONCLUSIVE') => {
    setUserConclusion(conclusion);
    setShowResultModal(true);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-[#080d1a] text-white font-sans lg:overflow-hidden">
      <SEO 
        title="Scientific Comparison Microscope Lab" 
        description="Interactive 3D Virtual Comparison Microscope. Analyze side-by-side forensic evidence including fired bullet striations, cartridge breechface marks, and textile fibers."
        canonicalPath="/simulations/comparison-microscope"
      />

      {/* 3D Viewport - Left Side */}
      <div className="w-full h-[45vh] lg:h-full lg:flex-1 relative border-b lg:border-b-0 lg:border-r border-white/10 flex-shrink-0">
        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-amber-500/30 flex items-center gap-2 shadow-lg">
          <Columns3 size={18} className="text-amber-400" />
          <span className="font-extrabold tracking-widest text-xs uppercase text-amber-200">
            Forensic Comparison Microscope 3D
          </span>
        </div>

        <div className="absolute bottom-4 left-4 z-10 text-xs text-white/40 uppercase tracking-widest pointer-events-none">
          Drag to rotate • Scroll to zoom 3D instrument
        </div>

        <Canvas camera={{ position: [0, 3, 9], fov: 42 }}>
          <color attach="background" args={['#080d1a']} />
          <ambientLight intensity={0.6} />
          <Environment preset="city" />
          <ComparisonMicroscope3D
            leftFocus={leftFocus}
            rightFocus={rightFocus}
            objective={objective}
            lightIntensity={lightIntensity}
            leftStageX={leftStageX}
            leftStageY={leftStageY}
            rightStageX={rightStageX}
            rightStageY={rightStageY}
            leftRotation={leftRotation}
            rightRotation={rightRotation}
            splitPosition={splitPosition}
            category={selectedCase.category}
          />
          <ContactShadows position={[0, -2.6, 0]} opacity={0.7} scale={12} blur={2.5} far={4} color="#000000" />
          <OrbitControls makeDefault minDistance={3} maxDistance={14} target={[0, 1.5, 0]} />
        </Canvas>
      </div>

      {/* Controls & Split Eyepiece - Right Side */}
      <div className="w-full lg:w-[560px] flex flex-col lg:h-full bg-surface lg:overflow-y-auto border-l border-white/10">
        
        {/* Case Selector Header */}
        <div className="p-4 bg-surface-hover/80 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <BookOpen size={14} /> Active Case: {selectedCase.caseNumber}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-info/20 text-info uppercase tracking-wider">
              {selectedCase.category}
            </span>
          </div>
          <select
            value={selectedCase.id}
            onChange={(e) => {
              const c = COMPARISON_CASES.find(item => item.id === e.target.value);
              if (c) {
                setSelectedCase(c);
                setUserConclusion(null);
                setLeftRotation(0);
                setRightRotation(0);
              }
            }}
            className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-sm font-bold text-text-main focus:outline-none focus:border-amber-400 transition-colors"
          >
            {COMPARISON_CASES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} ({item.caseNumber})
              </option>
            ))}
          </select>
          <p className="text-xs text-text-muted mt-2 leading-relaxed">
            {selectedCase.description}
          </p>
        </div>

        {/* EYEPIECE COMPARISON VIEW (SPLIT-FIELD OCULAR) */}
        <div className="p-6 flex flex-col items-center justify-center bg-black relative border-b border-white/10 shadow-2xl">
          <div className="w-full flex items-center justify-between mb-3 text-xs font-bold text-white/50 uppercase tracking-widest px-2">
            <span className="flex items-center gap-1.5 text-info">
              <Search size={14} /> {selectedCase.evidenceLabel}
            </span>
            <span className="text-amber-400">
              Split: {isSuperimposed ? 'Superimposed' : `${splitPosition}%`}
            </span>
            <span className="flex items-center gap-1.5 text-warning">
              {selectedCase.controlLabel} <Search size={14} />
            </span>
          </div>

          {/* Ocular Circle */}
          <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-8 border-[#111] shadow-[0_0_60px_rgba(0,0,0,1),inset_0_0_80px_rgba(0,0,0,1)] overflow-hidden relative bg-black flex items-center justify-center">
            
            {/* Split-Screen Mode */}
            {!isSuperimposed ? (
              <>
                {/* Left Evidence Image (0% to splitPosition%) */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden transition-all duration-75"
                  style={{ width: `${splitPosition}%` }}
                >
                  <div
                    className="absolute inset-0 bg-no-repeat transition-transform duration-100"
                    style={{
                      width: '320px',
                      height: '320px',
                      backgroundImage: `url(${selectedCase.evidenceImg})`,
                      backgroundSize: '800px',
                      backgroundPosition: `${leftStageX}% ${leftStageY}%`,
                      filter: `blur(${leftBlur}px) brightness(${brightness}) contrast(${1 + (90 - obliqueAngle) * 0.012}) drop-shadow(${Math.cos(obliqueAngle * Math.PI / 180) * 8}px ${Math.sin(obliqueAngle * Math.PI / 180) * 8}px 4px rgba(0,0,0,0.8)) ${plmPolarized ? 'hue-rotate(180deg) invert(0.15) saturate(2)' : 'sepia(0.05)'}`,
                      transform: `scale(${scaleMultiplier}) rotate(${leftRotation}deg)`,
                      transformOrigin: 'center center'
                    }}
                  />
                </div>

                {/* Right Control Image (splitPosition% to 100%) */}
                <div
                  className="absolute inset-y-0 right-0 overflow-hidden transition-all duration-75"
                  style={{ width: `${100 - splitPosition}%` }}
                >
                  <div
                    className="absolute top-0 right-0 transition-transform duration-100"
                    style={{
                      width: '320px',
                      height: '320px',
                      backgroundImage: `url(${selectedCase.controlImg})`,
                      backgroundSize: '800px',
                      backgroundPosition: `${rightStageX}% ${rightStageY}%`,
                      filter: `blur(${rightBlur}px) brightness(${brightness}) contrast(${1 + (90 - obliqueAngle) * 0.012}) drop-shadow(${Math.cos(obliqueAngle * Math.PI / 180) * 8}px ${Math.sin(obliqueAngle * Math.PI / 180) * 8}px 4px rgba(0,0,0,0.8)) ${plmPolarized ? 'hue-rotate(180deg) invert(0.15) saturate(2)' : 'sepia(0.05)'}`,
                      transform: `scale(${scaleMultiplier}) rotate(${rightRotation - selectedCase.matchAngle}deg)`,
                      transformOrigin: 'center center'
                    }}
                  />
                </div>

                {/* Vertical Optical Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_12px_#f59e0b] z-20 pointer-events-none"
                  style={{ left: `calc(${splitPosition}% - 2px)` }}
                />
              </>
            ) : (
              /* Superimposed / Translucent Overlay Mode */
              <div className="relative w-full h-full">
                <div
                  className="absolute inset-0 bg-no-repeat"
                  style={{
                    backgroundImage: `url(${selectedCase.evidenceImg})`,
                    backgroundSize: '800px',
                    backgroundPosition: `${leftStageX}% ${leftStageY}%`,
                    filter: `blur(${leftBlur}px) brightness(${brightness}) ${plmPolarized ? 'hue-rotate(180deg) invert(0.15) saturate(2)' : ''}`,
                    transform: `scale(${scaleMultiplier}) rotate(${leftRotation}deg)`
                  }}
                />
                <div
                  className="absolute inset-0 bg-no-repeat transition-opacity duration-150"
                  style={{
                    backgroundImage: `url(${selectedCase.controlImg})`,
                    backgroundSize: '800px',
                    backgroundPosition: `${rightStageX}% ${rightStageY}%`,
                    filter: `blur(${rightBlur}px) brightness(${brightness}) ${plmPolarized ? 'hue-rotate(180deg) invert(0.15) saturate(2)' : ''}`,
                    transform: `scale(${scaleMultiplier}) rotate(${rightRotation - selectedCase.matchAngle}deg)`,
                    opacity: superimposeOpacity / 100
                  }}
                />
              </div>
            )}

            {/* Reticle / Crosshair & Micrometer Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
              <div className="w-full h-[1px] bg-amber-400/40" />
              <div className="absolute top-0 bottom-0 w-[1px] bg-amber-400/40" />
              <div className="w-20 h-20 rounded-full border border-amber-400/30" />
              <div className="w-48 h-48 rounded-full border border-dashed border-amber-400/20" />

              {/* Micrometer Scale Ticks */}
              {showMicrometer && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full flex justify-between px-6 text-[9px] font-mono text-amber-300/80">
                    <span>-50μm</span>
                    <span>-25μm</span>
                    <span className="font-bold text-amber-400">0</span>
                    <span>+25μm</span>
                    <span>+50μm</span>
                  </div>
                </div>
              )}
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_90px_rgba(0,0,0,0.95)] rounded-full pointer-events-none" />
          </div>

          {/* Live Striae Alignment Gauge (Biasotti-Murdock CMS Criterion) */}
          <div className="w-full mt-3 px-2 flex items-center justify-between bg-surface-hover/60 p-2.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full transition-all",
                matchPercentage > 88 ? "bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" : "bg-amber-400"
              )} />
              <span className="text-xs font-black uppercase tracking-wider text-text-muted">
                CMS Alignment Gauge:
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold">
              <span className={cn(
                matchPercentage > 88 ? "text-emerald-400 font-extrabold" : "text-amber-300"
              )}>
                {matchPercentage}% Striae Match
              </span>
              {matchPercentage > 88 && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-sans font-extrabold uppercase tracking-wider">
                  Biasotti Rule Met!
                </span>
              )}
            </div>
          </div>

          {/* Forensic Illumination & Eyepiece Toolbar */}
          <div className="w-full mt-3 grid grid-cols-2 gap-2 px-2">
            <button
              onClick={() => setPlmPolarized(!plmPolarized)}
              className={cn(
                "py-1.5 px-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all",
                plmPolarized ? "bg-purple-600/30 border-purple-400 text-purple-300" : "bg-surface border-white/10 text-text-muted hover:text-white"
              )}
            >
              <Layers size={14} /> Polarized Light (PLM)
            </button>
            <button
              onClick={() => setShowMicrometer(!showMicrometer)}
              className={cn(
                "py-1.5 px-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all",
                showMicrometer ? "bg-amber-500/30 border-amber-400 text-amber-300" : "bg-surface border-white/10 text-text-muted hover:text-white"
              )}
            >
              <Sliders size={14} /> Micrometer Reticle
            </button>
          </div>

          {/* Optical Bridge Controls (Split Slider & Overlay Toggle) */}
          <div className="w-full mt-4 space-y-3 px-2">
            <div className="flex items-center justify-between text-xs font-bold text-text-muted">
              <span className="flex items-center gap-1">
                <Sliders size={14} className="text-amber-400" /> Optical Bridge Line Position
              </span>
              <button
                onClick={() => setIsSuperimposed(!isSuperimposed)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] uppercase tracking-wider font-extrabold transition-colors flex items-center gap-1 border",
                  isSuperimposed 
                    ? "bg-amber-500 text-black border-amber-400 shadow-md" 
                    : "bg-surface border-white/20 text-text-muted hover:text-white"
                )}
              >
                <Layers size={12} /> {isSuperimposed ? "Mode: Superimpose" : "Mode: Split Screen"}
              </button>
            </div>

            {!isSuperimposed ? (
              <input
                type="range"
                min="5"
                max="95"
                value={splitPosition}
                onChange={(e) => setSplitPosition(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">Overlay Opacity:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={superimposeOpacity}
                  onChange={(e) => setSuperimposeOpacity(Number(e.target.value))}
                  className="flex-1 accent-amber-400 cursor-pointer"
                />
                <span className="text-xs font-mono text-amber-300">{superimposeOpacity}%</span>
              </div>
            )}
          </div>
        </div>

        {/* CONTROLS SECTION */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Synchronized Stages & Objective Lens Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-hover/50 p-3 rounded-xl border border-white/10">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
                Magnification
              </label>
              <div className="grid grid-cols-4 gap-1">
                {OBJECTIVES.map((obj) => (
                  <button
                    key={obj}
                    onClick={() => setObjective(obj)}
                    className={cn(
                      "py-1.5 rounded-lg text-xs font-black transition-all",
                      objective === obj 
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/20" 
                        : "bg-black/40 text-text-muted hover:bg-white/10"
                    )}
                  >
                    {obj}x
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface-hover/50 p-3 rounded-xl border border-white/10 flex flex-col justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                Stage Lock
              </label>
              <button
                onClick={() => setIsSynced(!isSynced)}
                className={cn(
                  "w-full py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border",
                  isSynced
                    ? "bg-info text-black border-info shadow-md"
                    : "bg-black/40 text-text-muted border-white/10 hover:text-white"
                )}
              >
                {isSynced ? <Link2 size={16} /> : <Unlink2 size={16} />}
                {isSynced ? "Synced Stages" : "Independent"}
              </button>
            </div>
          </div>

          {/* DUAL STAGE CONTROL PANELS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Stage Controls */}
            <div className="p-4 rounded-xl bg-surface-hover/40 border border-info/30 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-info">
                  Left Specimen (Ev. A)
                </span>
                <span className="text-[10px] font-mono text-text-muted">{leftRotation}°</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-muted flex items-center gap-1 mb-1">
                  <RotateCw size={12} /> Specimen Rotation
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={leftRotation}
                  onChange={(e) => handleLeftRotationChange(Number(e.target.value))}
                  className="w-full accent-info cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-muted flex items-center gap-1 mb-1">
                  <Search size={12} /> Focus Fine-Tune
                </label>
                <input
                  type="range"
                  min="30"
                  max="70"
                  value={leftFocus}
                  onChange={(e) => setLeftFocus(Number(e.target.value))}
                  className="w-full accent-info cursor-pointer"
                />
              </div>
            </div>

            {/* Right Stage Controls */}
            <div className="p-4 rounded-xl bg-surface-hover/40 border border-warning/30 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-warning">
                  Right Specimen (Ctrl B)
                </span>
                <span className="text-[10px] font-mono text-text-muted">{rightRotation}°</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-muted flex items-center gap-1 mb-1">
                  <RotateCw size={12} /> Specimen Rotation
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rightRotation}
                  onChange={(e) => handleRightRotationChange(Number(e.target.value))}
                  className="w-full accent-warning cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-muted flex items-center gap-1 mb-1">
                  <Search size={12} /> Focus Fine-Tune
                </label>
                <input
                  type="range"
                  min="30"
                  max="70"
                  value={rightFocus}
                  onChange={(e) => setRightFocus(Number(e.target.value))}
                  className="w-full accent-warning cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Incident Light Illumination Control */}
          <div className="p-4 rounded-xl bg-surface-hover/40 border border-white/10 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-amber-400" /> Reflected Spotlights Intensity
                </span>
                <span className="font-mono text-amber-300">{lightIntensity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={lightIntensity}
                onChange={(e) => setLightIntensity(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs font-bold text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Sliders size={14} className="text-amber-400" /> Gooseneck Grazing Light Angle (Oblique)
                </span>
                <span className="font-mono text-amber-300">{obliqueAngle}° Incident</span>
              </div>
              <input
                type="range"
                min="15"
                max="75"
                value={obliqueAngle}
                onChange={(e) => setObliqueAngle(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[10px] text-text-muted italic">
                *Adjust oblique angle to cast directional grazing shadows inside land/groove micro-striations.
              </p>
            </div>
          </div>

          {/* FORENSIC CONCLUSION ASSESSMENT BUTTONS */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-text-muted">
              <span>Scientific Conclusion Assessment</span>
              <span className="text-amber-400 flex items-center gap-1">
                <Award size={14} /> Expert Evaluation
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleVerifyConclusion('MATCH')}
                className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={16} /> Positive Match
              </button>

              <button
                onClick={() => handleVerifyConclusion('ELIMINATION')}
                className="py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <XCircle size={16} /> Elimination
              </button>

              <button
                onClick={() => handleVerifyConclusion('INCONCLUSIVE')}
                className="py-2.5 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Info size={16} /> Inconclusive
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* RESULTS VERIFICATION MODAL */}
      {showResultModal && userConclusion && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface border border-white/20 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-widest">
                <Award size={20} /> Official Forensic Lab Verification
              </div>
              <button 
                onClick={() => setShowResultModal(false)}
                className="text-text-muted hover:text-white text-xs font-bold uppercase tracking-widest px-2 py-1 bg-black/40 rounded-lg"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-text-muted">
                Case File: <span className="text-white font-mono">{selectedCase.caseNumber}</span>
              </div>

              <div className="p-4 rounded-xl bg-surface-hover border border-white/10 flex items-center gap-3">
                {userConclusion === selectedCase.matchType ? (
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={28} />
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <XCircle size={28} />
                  </div>
                )}

                <div>
                  <div className="text-xs uppercase tracking-wider font-extrabold text-text-muted">
                    Your Conclusion: <span className="text-amber-300">{userConclusion}</span>
                  </div>
                  <div className="text-sm font-black text-white mt-0.5">
                    {userConclusion === selectedCase.matchType 
                      ? "Correct Forensic Finding! 🎉" 
                      : `Expected Analysis: ${selectedCase.matchType}`}
                  </div>
                </div>
              </div>

              <div className="bg-black/50 p-4 rounded-xl border border-white/10 space-y-2 text-xs">
                <span className="font-bold text-amber-400 uppercase tracking-widest block">
                  Expert Scientific Rationale:
                </span>
                <p className="text-text-muted leading-relaxed">
                  {selectedCase.rationale}
                </p>
                <div className="pt-2 text-[11px] text-text-muted font-mono border-t border-white/10">
                  Technical Spec: {selectedCase.evidenceDetails}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowResultModal(false)}
              className="w-full py-3 rounded-xl bg-amber-500 text-black font-extrabold uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              Continue Simulation
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
