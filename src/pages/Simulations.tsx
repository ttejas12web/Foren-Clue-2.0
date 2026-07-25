import { Link } from 'react-router-dom';
import { Microscope, Beaker, ArrowRight } from 'lucide-react';

const SIMULATIONS = [
  {
    id: 'microscope',
    title: 'Virtual Microscope',
    description: 'Explore various microscopic samples including synthetic fibers, pollen grains, and salt crystals in an interactive 3D environment.',
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
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-text-main mb-4">
          Virtual <span className="text-info">Laboratory</span>
        </h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          Experience hands-on forensic analysis through our interactive 3D simulations. Choose an instrument to begin your practical session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
