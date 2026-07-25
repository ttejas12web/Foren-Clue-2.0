import { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Beaker, Search, Activity, Power, MoveHorizontal, Droplets } from 'lucide-react';
import { Spectrophotometer3D } from '../components/laboratory/Spectrophotometer3D';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SAMPLES = [
  { id: 'blank', name: 'Blank (Distilled Water)', baseAbsorbance: 0.0, peakWavelength: 400, color: '#ffffff' },
  { id: 'blood', name: 'Presumptive Blood (Kastle-Meyer positive)', baseAbsorbance: 0.85, peakWavelength: 540, color: '#e11d48' },
  { id: 'ink_blue', name: 'Document Ink (Blue Pen)', baseAbsorbance: 0.65, peakWavelength: 590, color: '#2563eb' },
  { id: 'ink_black', name: 'Document Ink (Black Pen)', baseAbsorbance: 0.95, peakWavelength: 600, color: '#111111' },
  { id: 'ninhydrin', name: 'Ninhydrin Developed Print Extract', baseAbsorbance: 0.70, peakWavelength: 570, color: '#7c3aed' },
];

export default function SpectrophotometerLab() {
  const [currentSample, setCurrentSample] = useState(SAMPLES[0]);
  const [wavelength, setWavelength] = useState(400); // 400 to 700 nm
  const [lidOpen, setLidOpen] = useState(false);
  const [cuvetteInserted, setCuvetteInserted] = useState(false);
  const [powerOn, setPowerOn] = useState(true);
  const [zeroed, setZeroed] = useState(false);

  // Calculate current absorbance based on sample and wavelength (simple gaussian curve simulation)
  const currentAbsorbance = useMemo(() => {
    if (!powerOn || !cuvetteInserted || lidOpen) return 0.000;
    
    if (currentSample.id === 'blank') {
      return zeroed ? 0.000 : 0.050; // A bit of noise if not zeroed
    }
    
    // Simulating a bell curve around the peak wavelength
    const sigma = 40; // width of the peak
    const peak = currentSample.peakWavelength;
    const maxAbs = currentSample.baseAbsorbance;
    
    const mathAbs = maxAbs * Math.exp(-Math.pow(wavelength - peak, 2) / (2 * Math.pow(sigma, 2)));
    
    // Add some baseline noise and offset if not zeroed
    const noise = Math.random() * 0.005;
    const offset = zeroed ? 0 : 0.050;
    
    return Math.max(0, mathAbs + noise + offset);
  }, [currentSample, wavelength, lidOpen, cuvetteInserted, powerOn, zeroed]);

  // Generate chart data for the current sample
  const chartData = useMemo(() => {
    const data = [];
    for (let w = 400; w <= 700; w += 10) {
      if (currentSample.id === 'blank') {
         data.push({ wavelength: w, absorbance: 0 });
         continue;
      }
      const sigma = 40;
      const mathAbs = currentSample.baseAbsorbance * Math.exp(-Math.pow(w - currentSample.peakWavelength, 2) / (2 * Math.pow(sigma, 2)));
      data.push({ wavelength: w, absorbance: mathAbs });
    }
    return data;
  }, [currentSample]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
      
      {/* 3D Viewport - Left Side */}
      <div className="flex-1 relative min-h-[50vh] lg:min-h-full border-r border-white/10">
        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
          <Beaker size={20} className="text-warning" />
          <span className="font-bold tracking-widest text-sm uppercase">Spectrophotometer 3D</span>
        </div>
        <div className="absolute bottom-4 left-4 z-10 text-xs text-white/40 uppercase tracking-widest pointer-events-none">
          Drag to rotate • Scroll to zoom
        </div>
        
        <Canvas camera={{ position: [4, 3, 5], fov: 45 }}>
          <color attach="background" args={['#0a0a0a']} />
          <ambientLight intensity={0.5} />
          <Environment preset="city" />
          <Spectrophotometer3D 
             lidOpen={lidOpen} 
             cuvetteInserted={cuvetteInserted} 
             wavelength={wavelength} 
          />
          <OrbitControls makeDefault minDistance={3} maxDistance={15} target={[0, 0, 0]} />
        </Canvas>
      </div>

      {/* Controls & Readings - Right Side */}
      <div className="w-full lg:w-[500px] flex flex-col h-full bg-surface overflow-y-auto">
        
        {/* Digital Display */}
        <div className="p-8 bg-[#0a0a0a] border-b border-white/5 relative">
           <div className="absolute top-4 left-4 text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> LCD Readout
           </div>
           
           <div className="mt-4 bg-[#111] border border-white/10 p-6 rounded-xl font-mono relative overflow-hidden">
             {/* Screen Glare */}
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
             
             {powerOn ? (
               <div className="flex flex-col items-center justify-center gap-4 text-[#00ff00]">
                 <div className="flex items-end gap-2">
                   <span className="text-6xl font-light tracking-tighter">
                     {currentAbsorbance.toFixed(3)}
                   </span>
                   <span className="text-xl pb-1 opacity-70">Abs</span>
                 </div>
                 <div className="flex gap-6 text-sm opacity-70">
                   <span>WL: {wavelength} nm</span>
                   <span>Status: {lidOpen ? 'LID OPEN' : 'READY'}</span>
                 </div>
               </div>
             ) : (
               <div className="flex h-24 items-center justify-center">
                 <span className="text-white/10 text-xl uppercase tracking-widest">Power Off</span>
               </div>
             )}
           </div>
        </div>

        {/* Controls Panel */}
        <div className="p-6 flex flex-col gap-6 flex-1">
          
           {/* Power & Basic Actions */}
           <div className="flex gap-4">
              <button 
                onClick={() => setPowerOn(!powerOn)}
                className={cn(
                  "flex-1 py-3 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 uppercase tracking-widest",
                  powerOn 
                    ? "bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30" 
                    : "bg-green-500/20 text-green-500 border-green-500/50 hover:bg-green-500/30"
                )}
              >
                <Power size={16} />
                {powerOn ? 'Turn Off' : 'Turn On'}
              </button>
              <button 
                onClick={() => {
                  if(powerOn && !lidOpen && cuvetteInserted && currentSample.id === 'blank') {
                    setZeroed(true);
                  }
                }}
                disabled={!powerOn || lidOpen || !cuvetteInserted}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                Zero (Blank)
              </button>
           </div>

           {/* Hardware Interaction */}
           <div className="space-y-3 bg-black/20 p-5 rounded-2xl border border-white/5">
             <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
               Hardware Controls
             </label>
             <div className="flex gap-4">
               <button 
                 onClick={() => setLidOpen(!lidOpen)}
                 className="flex-1 py-2 rounded-lg text-sm bg-surface-hover border border-white/10 hover:border-white/20 transition-all"
               >
                 {lidOpen ? 'Close Lid' : 'Open Lid'}
               </button>
               <button 
                 onClick={() => setCuvetteInserted(!cuvetteInserted)}
                 disabled={!lidOpen}
                 className="flex-1 py-2 rounded-lg text-sm bg-surface-hover border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
               >
                 {cuvetteInserted ? 'Remove Cuvette' : 'Insert Cuvette'}
               </button>
             </div>
           </div>

           {/* Sample Selection */}
           <div className="space-y-3">
             <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
               <Droplets size={14} /> Sample Cuvette
             </label>
             <select 
               className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-warning outline-none transition-all cursor-pointer"
               value={currentSample.id}
               onChange={(e) => setCurrentSample(SAMPLES.find(s => s.id === e.target.value) || SAMPLES[0])}
               disabled={!lidOpen}
             >
               {SAMPLES.map(s => (
                 <option key={s.id} value={s.id}>{s.name}</option>
               ))}
             </select>
             {!lidOpen && <p className="text-[10px] text-warning uppercase tracking-widest">Open lid to change sample</p>}
           </div>

           {/* Wavelength Control */}
           <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5">
             <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center justify-between">
               <span className="flex items-center gap-2"><MoveHorizontal size={14}/> Wavelength (nm)</span>
               <span className="text-white/50">{wavelength} nm</span>
             </label>
             <input 
                type="range" min="400" max="700" step="5"
               value={wavelength} onChange={(e) => setWavelength(Number(e.target.value))}
               className="w-full accent-warning h-2 bg-black rounded-full appearance-none cursor-pointer"
             />
             <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest font-bold">
               <span>400 (Violet)</span>
               <span>700 (Red)</span>
             </div>
           </div>

           {/* Spectral Analysis Chart */}
           <div className="space-y-3 pt-2">
             <label className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
               Spectral Analysis Profile (Reference)
             </label>
             <div className="h-48 w-full bg-black/40 rounded-xl p-4 border border-white/5">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                   <XAxis dataKey="wavelength" stroke="rgba(255,255,255,0.3)" fontSize={10} tickFormatter={(v) => `${v}nm`} />
                   <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 1]} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)' }}
                     itemStyle={{ color: currentSample.color }}
                   />
                   <Line 
                     type="monotone" 
                     dataKey="absorbance" 
                     stroke={currentSample.color} 
                     strokeWidth={2} 
                     dot={false}
                   />
                   {/* Current Wavelength Marker */}
                   <Line 
                      type="monotone"
                      dataKey={() => undefined}
                      stroke="transparent"
                      strokeWidth={0}
                      dot={(props: any) => {
                         if (props.payload.wavelength === wavelength && cuvetteInserted && powerOn && !lidOpen) {
                             return <circle cx={props.cx} cy={props.cy} r={4} fill="#00ff00" />;
                         }
                         return <></>;
                      }}
                   />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}
