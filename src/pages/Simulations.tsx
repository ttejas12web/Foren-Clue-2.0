import { Link } from 'react-router-dom';
import { Microscope, Columns3, Beaker, ArrowRight } from 'lucide-react';

const SIMULATIONS = [
  {
    id: 'comparison_microscope',
    title: 'Forensic Comparison Microscope',
    description: 'Perform split-screen side-by-side microscopic comparison of evidence vs control samples including fired bullet striations, cartridge breechface marks, and textile fibers.',
    icon: Columns3,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    path: '/simulations/comparison-microscope'
  },
  {
    id: 'microscope',
    title: 'Virtual Compound Microscope',
    description: 'Explore various microscopic samples using a compound optical system featuring dual-stage magnification (4x, 10x, 40x, 100x objective lenses) in interactive 3D.',
    icon: Microscope,
    color: 'text-info',
    bg: 'bg-info/10',
    path: '/simulations/microscope'
  },
  {
    id: 'spectrophotometer',
    title: 'Spectrophotometer',
    description: 'Perform hands-on virtual experiments to analyze absorbance and concentration of different forensic samples.',
    icon: Beaker,
    color: 'text-warning',
    bg: 'bg-warning/10',
    path: '/simulations/spectrophotometer'
  }
];

export default function Simulations() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-text-main mb-4">
          Virtual <span className="text-info">Laboratory</span>
        </h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          Experience hands-on forensic analysis through our interactive 3D simulations. Choose an instrument to begin your practical session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SIMULATIONS.map((sim) => {
          const Icon = sim.icon;
          return (
            <Link 
              key={sim.id}
              to={sim.path}
              className="bg-surface border border-white/10 rounded-2xl p-8 hover:bg-surface-hover transition-all group flex flex-col items-start"
            >
              <div className={`p-4 rounded-2xl ${sim.bg} ${sim.color} mb-6 group-hover:scale-110 transition-transform`}>
                <Icon size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-black tracking-wider text-text-main mb-3 uppercase">
                {sim.title}
              </h2>
              <p className="text-text-muted leading-relaxed mb-8 flex-1">
                {sim.description}
              </p>
              <div className={`flex items-center gap-2 font-bold uppercase tracking-widest text-sm ${sim.color} group-hover:gap-4 transition-all`}>
                Start Simulation <ArrowRight size={16} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
