import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Microscope3D } from '@/components/laboratory/Microscope3D';
import { Microscope, Settings2, Lightbulb, Move, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import plantEpidermisImg from '@/assets/images/plant_epidermis_microscope_1785090601160.jpg';
import syntheticFiberImg from '@/assets/images/synthetic_fiber_microscope_1785090621165.jpg';
import pollenGrainsImg from '@/assets/images/pollen_grains_microscope_1785090638783.jpg';
import bloodStainsImg from '@/assets/images/blood_stains_microscope_1785090877110.jpg';

const SAMPLES = [
  { id: 's1', name: 'Red Blood Cells', url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800' },
  { id: 's2', name: 'Plant Epidermis', url: plantEpidermisImg },
  { id: 's3', name: 'Synthetic Fiber', url: syntheticFiberImg },
  { id: 's4', name: 'Pollen Grains', url: pollenGrainsImg },
  { id: 's5', name: 'Blood Stains', url: bloodStainsImg },
];

const OBJECTIVES = [4, 10, 40, 100];

export default function MicroscopeLab() {
  const [currentSample, setCurrentSample] = useState(SAMPLES[0]);
  
  // Microscope State
  const [objective, setObjective] = useState(4);
  const [lightIntensity, setLightIntensity] = useState(50);
  const [coarseFocus, setCoarseFocus] = useState(20);
  const [fineFocus, setFineFocus] = useState(50);
  const [stageX, setStageX] = useState(50);
  const [stageY, setStageY] = useState(50);

  // Math for rendering Eyepiece
  const perfectFocus = 50; 
  const totalFocus = coarseFocus + (fineFocus - 50) * 0.1;
  const diff = Math.abs(totalFocus - perfectFocus);
  
  // Higher objectives have narrower depth of field, so they blur faster
  const blurAmount = diff * (objective / 10) * 0.5;
  
  const scaleMultiplier = objective / 4; // 4x = 1, 10x = 2.5, 40x = 10, 100x = 25
  const brightness = Math.max(0.1, lightIntensity / 100);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-[#0a0a0a] text-white font-sans lg:overflow-hidden">
      
      {/* 3D Viewport - Left Side */}
      <div className="w-full h-[50vh] lg:h-full lg:flex-1 relative border-b lg:border-b-0 lg:border-r border-white/10 flex-shrink-0">
        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
          <Microscope size={20} className="text-info" />
          <span className="font-bold tracking-widest text-sm uppercase">Compound Microscope 3D</span>
        </div>
        
        <div className="absolute bottom-4 left-4 z-10 text-xs text-white/40 uppercase tracking-widest pointer-events-none">
          Drag to rotate • Scroll to zoom
        </div>
        
        <Canvas camera={{ position: [5, 2, 5], fov: 45 }}>
          <color attach="background" args={['#0a0a0a']} />
          <ambientLight intensity={0.5} />
          <Environment preset="city" />
          <Microscope3D 
            focus={coarseFocus} 
            objective={objective} 
            lightIntensity={lightIntensity}
            stageX={stageX}
            stageY={stageY}
          />
          <ContactShadows position={[0, -3.2, 0]} opacity={0.6} scale={10} blur={2.5} far={4} color="#000000" />
          <OrbitControls makeDefault minDistance={2} maxDistance={15} target={[0, 1, 0]} />
        </Canvas>
      </div>

      {/* Controls & Eyepiece - Right Side */}
      <div className="w-full lg:w-[500px] flex flex-col lg:h-full bg-surface lg:overflow-y-auto">
        
        {/* Eyepiece View */}
        <div className="p-8 flex justify-center bg-black relative shadow-inner">
           <div className="absolute top-4 left-4 text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
              <Search size={14} /> Eyepiece View ({objective}x)
           </div>
           <div 
              className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border-8 border-[#111] shadow-[0_0_50px_rgba(0,0,0,1),inset_0_0_80px_rgba(0,0,0,1)] overflow-hidden relative bg-black flex items-center justify-center pointer-events-none"
           >
              {/* Sample Image */}
              <div 
                className="absolute inset-0 bg-no-repeat transition-all duration-300"
                style={{ 
                  backgroundImage: `url(${currentSample.url})`,
                  backgroundSize: '800px', // base size
                  backgroundPosition: `${stageX}% ${stageY}%`,
                  filter: `blur(${blurAmount}px) brightness(${brightness}) sepia(0.2) hue-rotate(-5deg)`,
                  transform: `scale(${scaleMultiplier})`,
                }}
              />
              
              {/* Lens dirt & vignette */}
              <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,1)] rounded-full mix-blend-multiply" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-30 mix-blend-screen" />
              
              {/* Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-full h-[1px] bg-black" />
                <div className="h-full w-[1px] bg-black absolute" />
              </div>
           </div>
        </div>

        {/* Controls Panel */}
        <div className="p-6 flex flex-col gap-6 flex-1">
           
           {/* Sample Selection */}
           <div className="space-y-3">
             <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
               Slide Selection
             </label>
             <select 
               className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-info outline-none transition-all cursor-pointer"
               value={currentSample.id}
               onChange={(e) => setCurrentSample(SAMPLES.find(s => s.id === e.target.value) || SAMPLES[0])}
             >
               {SAMPLES.map(s => (
                 <option key={s.id} value={s.id}>{s.name}</option>
               ))}
             </select>
           </div>

           {/* Objective Lenses */}
           <div className="space-y-3">
             <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
               Objective Lens (Revolving Nosepiece)
             </label>
             <div className="flex gap-2">
               {OBJECTIVES.map(obj => (
                 <button
                   key={obj}
                   onClick={() => setObjective(obj)}
                   className={cn(
                     "flex-1 py-3 rounded-xl font-bold text-sm transition-all border",
                     objective === obj 
                       ? "bg-info text-black border-info shadow-[0_0_15px_rgba(56,189,248,0.3)]" 
                       : "bg-black/40 text-white/50 border-white/5 hover:bg-white/5"
                   )}
                 >
                   {obj}x
                 </button>
               ))}
             </div>
           </div>

           {/* Focus Controls */}
           <div className="space-y-5 bg-black/20 p-5 rounded-2xl border border-white/5">
             <div className="space-y-3">
               <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center justify-between">
                 <span className="flex items-center gap-2"><Settings2 size={14}/> Coarse Adjustment</span>
                 <span className="text-white/30">{coarseFocus.toFixed(0)}</span>
               </label>
               <input 
                 type="range" min="0" max="100" step="1"
                 value={coarseFocus} onChange={(e) => setCoarseFocus(Number(e.target.value))}
                 className="w-full accent-info h-2 bg-black rounded-full appearance-none cursor-pointer"
               />
             </div>
             
             <div className="space-y-3">
               <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center justify-between">
                 <span className="flex items-center gap-2"><Settings2 size={14} className="opacity-50"/> Fine Adjustment</span>
                 <span className="text-white/30">{fineFocus.toFixed(0)}</span>
               </label>
               <input 
                 type="range" min="0" max="100" step="1"
                 value={fineFocus} onChange={(e) => setFineFocus(Number(e.target.value))}
                 className="w-full accent-white h-2 bg-black rounded-full appearance-none cursor-pointer"
               />
             </div>
           </div>

           {/* Stage & Light */}
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                 <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                   <Lightbulb size={14}/> Illuminator
                 </label>
                 <input 
                   type="range" min="0" max="100" step="1"
                   value={lightIntensity} onChange={(e) => setLightIntensity(Number(e.target.value))}
                   className="w-full accent-warning h-2 bg-black rounded-full appearance-none cursor-pointer"
                 />
              </div>

              <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                 <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                   <Move size={14}/> Mechanical Stage
                 </label>
                 <div className="flex flex-col gap-3">
                   <input 
                     type="range" min="0" max="100" step="1"
                     value={stageX} onChange={(e) => setStageX(Number(e.target.value))}
                     className="w-full accent-info h-1.5 bg-black rounded-full appearance-none cursor-pointer"
                     title="X Axis"
                   />
                   <input 
                     type="range" min="0" max="100" step="1"
                     value={stageY} onChange={(e) => setStageY(Number(e.target.value))}
                     className="w-full accent-info h-1.5 bg-black rounded-full appearance-none cursor-pointer"
                     title="Y Axis"
                   />
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
