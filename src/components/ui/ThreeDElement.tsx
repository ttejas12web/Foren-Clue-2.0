import React, { useRef, Component, ReactNode, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Sphere, Cylinder, MeshDistortMaterial, Torus, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Dna, FlaskConical, Search, Binary } from 'lucide-react';

// Caching WebGL Support Check
let hasWebGLCached: boolean | null = null;
function checkWebGLSync(): boolean {
  if (hasWebGLCached !== null) return hasWebGLCached;
  try {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    hasWebGLCached = !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
    return hasWebGLCached;
  } catch (e) {
    hasWebGLCached = false;
    return false;
  }
}

// Local Error Boundary to swallow WebGL and React-Three-Fiber failures gracefully
class LocalErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.warn("Local 3D Canvas error caught, falling back gracefully to static animation:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Visual loading shimmer shown while ThreeJS environments load
function ThreeDLoader({ text = "Loading Simulation" }: { text?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-transparent select-none z-20">
      <div className="relative flex items-center justify-center mb-4">
        {/* Outer Ring */}
        <div className="w-10 h-10 rounded-full border-2 border-warning/10 border-t-warning animate-spin" />
        {/* Inner core */}
        <div className="absolute w-5 h-5 rounded-full bg-warning/5 animate-pulse" />
      </div>
      <span className="font-mono text-[9px] uppercase tracking-widest text-warning/60 animate-pulse">
        {text}
      </span>
    </div>
  );
}

// --- ELEGANT COMPENSATORY SVG/CSS PLACEHOLDERS ---

function DNAPlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none bg-transparent">
      {/* Abstract background pulsing layer */}
      <div className="absolute w-40 h-40 bg-warning/5 rounded-full blur-3xl animate-pulse" />
      
      {/* Spinning Waves helix in pure CSS */}
      <div className="flex flex-col gap-3 justify-center items-center relative z-10">
        <div className="flex gap-3 md:gap-4 relative h-28 items-center justify-center">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-between h-20"
              style={{
                animation: `dna-twist 3s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              <div className="w-2.5 h-2.5 bg-warning rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <div className="w-[1px] bg-white/20 grow" />
              <div className="w-2 h-2 bg-text-muted/40 rounded-full" />
            </div>
          ))}
        </div>
        
        <span className="text-[10px] uppercase font-mono tracking-widest text-warning/50 mt-4 flex items-center gap-1.5">
          <Dna className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
          <span>Biometric Helix</span>
        </span>
      </div>
      
      <style>{`
        @keyframes dna-twist {
          0%, 100% {
            transform: scaleY(1) rotate(0deg);
          }
          50% {
            transform: scaleY(-0.2) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
}

function FlaskPlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none bg-transparent">
      <div className="absolute w-40 h-40 bg-warning/5 rounded-full blur-3xl animate-pulse" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="p-4 bg-warning/5 border border-warning/10 rounded-2xl mb-3 animate-pulse">
          <FlaskConical className="w-10 h-10 text-warning animate-bounce" style={{ animationDuration: '3.5s' }} />
        </div>
        <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-warning/50">
          REAGENT ASSAY ACTIVE
        </span>
      </div>
    </div>
  );
}

// Custom wrapper to avoid direct re-use conflicts with "Search" inside original lucide
function MagnifyingGlassPlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none bg-transparent">
      <div className="absolute w-40 h-40 bg-warning/5 rounded-full blur-3xl animate-pulse" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="p-4 bg-warning/5 border border-warning/10 rounded-2xl mb-3 animate-pulse">
          <Search className="w-10 h-10 text-warning animate-pulse" style={{ animationDuration: '2.5s' }} />
        </div>
        <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-warning/50">
          OPTICAL DISCRIMINATION
        </span>
      </div>
    </div>
  );
}

function MicroscopePlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none bg-transparent">
      <div className="absolute w-40 h-40 bg-warning/5 rounded-full blur-3xl animate-pulse" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="p-4 bg-warning/5 border border-warning/10 rounded-2xl mb-3 animate-pulse">
          <Binary className="w-10 h-10 text-warning animate-pulse" style={{ animationDuration: '3s' }} />
        </div>
        <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-warning/50">
          MICRO-RESOLUTION SCALE
        </span>
      </div>
    </div>
  );
}

// --- ORIGINAL THREE.JS MODELS ---

function DNAHelix() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const pairs = 15;
  const nodes = [];

  for (let i = 0; i < pairs; i++) {
    const y = (i - pairs / 2) * 0.4;
    const angle = i * 0.6;
    const x = Math.cos(angle) * 1.5;
    const z = Math.sin(angle) * 1.5;

    nodes.push(
      <group key={i} position={[0, y, 0]}>
        {/* Connection */}
        <Cylinder args={[0.05, 0.05, 3]} rotation={[Math.PI / 2, 0, -angle]} receiveShadow castShadow>
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
        </Cylinder>
        {/* Left Node */}
        <Sphere args={[0.25, 32, 32]} position={[x, 0, z]} receiveShadow castShadow>
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
        </Sphere>
        {/* Right Node */}
        <Sphere args={[0.25, 32, 32]} position={[-x, 0, -z]} receiveShadow castShadow>
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
        </Sphere>
      </group>
    );
  }

  return <group ref={group}>{nodes}</group>;
}

function FloatingFlask() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.3;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={group} position={[0, -1, 0]}>
      {/* Base */}
      <Sphere args={[1.5, 32, 32]} position={[0, 0, 0]} receiveShadow castShadow>
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={0.9} 
          opacity={1} 
          metalness={0} 
          roughness={0}
          ior={1.5}
          thickness={0.5}
        />
      </Sphere>
      {/* Liquid inside */}
      <Sphere args={[1.4, 32, 32]} position={[0, -0.1, 0]} receiveShadow castShadow>
         <MeshDistortMaterial
          color="#00f0ff"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0}
        />
      </Sphere>
      {/* Neck */}
      <Cylinder args={[0.4, 0.6, 2.5]} position={[0, 2, 0]} receiveShadow castShadow>
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={0.9} 
          opacity={1} 
          metalness={0} 
          roughness={0}
          ior={1.5}
          thickness={0.5}
        />
      </Cylinder>
      {/* Rim */}
      <Cylinder args={[0.5, 0.5, 0.2]} position={[0, 3.25, 0]} receiveShadow castShadow>
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={0.9} 
          opacity={1} 
          metalness={0.1} 
          roughness={0.1}
          ior={1.5}
        />
      </Cylinder>
      {/* Small bubbles */}
      {[...Array(5)].map((_, i) => (
        <Sphere
          key={i}
          args={[0.1 * Math.random() + 0.05, 16, 16]}
          position={[
            (Math.random() - 0.5) * 1.5,
            Math.random() * 2,
            (Math.random() - 0.5) * 1.5,
          ]}
        >
          <meshStandardMaterial color="#ffffff" emissive="#00f0ff" emissiveIntensity={0.5} />
        </Sphere>
      ))}
    </group>
  );
}

function FloatingMagnifyingGlass() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      group.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={group} rotation={[0, 0, -Math.PI / 4]}>
      {/* Handle */}
      <Cylinder args={[0.15, 0.2, 2.5]} position={[0, -1.5, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#1a1a1a" attach="material" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Frame */}
      <Torus args={[1.2, 0.15, 16, 64]} position={[0, 1, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#00f0ff" attach="material" metalness={0.6} roughness={0.2} />
      </Torus>
      {/* Glass */}
      <Cylinder args={[1.1, 1.1, 0.05, 32]} position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={1} 
          opacity={1} 
          metalness={0} 
          roughness={0}
          ior={1.2}
          thickness={0.5}
        />
      </Cylinder>
    </group>
  );
}

function FloatingMicroscope() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.2;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={group} position={[0, -1.5, 0]}>
      {/* Base */}
      <Cylinder args={[1.2, 1.2, 0.2, 32]} position={[0, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#1a1a1a" attach="material" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Arm Bottom/Pillar */}
      <Cylinder args={[0.3, 0.3, 2]} position={[-0.6, 1, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#00f0ff" attach="material" metalness={0.6} roughness={0.2} />
      </Cylinder>
      {/* Stage */}
      <Cylinder args={[0.8, 0.8, 0.1, 32]} position={[0.2, 1.2, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#1a1a1a" attach="material" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Arm Curve (simplified as a box or angled cylinder) */}
      <Cylinder args={[0.3, 0.3, 2.5]} position={[-0.3, 2.5, 0]} rotation={[0, 0, Math.PI / 4]} receiveShadow castShadow>
        <meshStandardMaterial color="#00f0ff" attach="material" metalness={0.6} roughness={0.2} />
      </Cylinder>
      {/* Head */}
      <Cylinder args={[0.4, 0.4, 1.5]} position={[0.4, 3.2, 0]} rotation={[0, 0, -Math.PI / 8]} receiveShadow castShadow>
        <meshStandardMaterial color="#1a1a1a" attach="material" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Eyepiece */}
      <Cylinder args={[0.15, 0.15, 0.8]} position={[0.6, 4, 0]} rotation={[0, 0, -Math.PI / 8]} receiveShadow castShadow>
        <meshStandardMaterial color="#1a1a1a" attach="material" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Objective Lens */}
      <Cylinder args={[0.2, 0.1, 0.6]} position={[0.2, 2.3, 0]} rotation={[0, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#ffffff" attach="material" metalness={0.9} roughness={0.1} />
      </Cylinder>
      {/* Box base under objective */}
      <Cylinder args={[0.3, 0.4, 0.4]} position={[0.3, 2.7, 0]} rotation={[0, 0, -Math.PI / 8]} receiveShadow castShadow>
        <meshStandardMaterial color="#00f0ff" attach="material" metalness={0.6} roughness={0.2} />
      </Cylinder>
      {/* Glass Slide on Stage */}
      <Cylinder args={[0.3, 0.3, 0.05, 16]} position={[0.2, 1.3, 0]} receiveShadow castShadow>
        <meshPhysicalMaterial 
          color="#00f0ff" 
          transmission={1} 
          opacity={0.8} 
          metalness={0} 
          roughness={0}
          ior={1.2}
          thickness={0.1}
        />
      </Cylinder>
    </group>
  );
}

// --- SAFE EXPORTS WITH INTEGRATED WEBGL SAFETY & ENHANCED LOADING SKELETONS ---

export function DNAViewer({ className }: { className?: string }) {
  const isSupported = checkWebGLSync();
  const fallback = <DNAPlaceholder />;

  if (!isSupported) {
    return <div className={className || "w-full h-full min-h-[400px]"}>{fallback}</div>;
  }

  return (
    <div className={className || "w-full h-full min-h-[400px] relative"}>
      <LocalErrorBoundary fallback={fallback}>
        <Suspense fallback={<ThreeDLoader text="Initializing Helix Grid" />}>
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} intensity={2} castShadow penumbra={1} />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#00f0ff" />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
              <DNAHelix />
            </Float>
            <OrbitControls enableZoom={true} enablePan={false} minDistance={4} maxDistance={15} />
            <Environment preset="city" />
          </Canvas>
        </Suspense>
      </LocalErrorBoundary>
    </div>
  );
}

export function FlaskViewer({ className }: { className?: string }) {
  const isSupported = checkWebGLSync();
  const fallback = <FlaskPlaceholder />;

  if (!isSupported) {
    return <div className={className || "w-full h-full min-h-[400px]"}>{fallback}</div>;
  }

  return (
    <div className={className || "w-full h-full min-h-[400px] relative"}>
      <LocalErrorBoundary fallback={fallback}>
        <Suspense fallback={<ThreeDLoader text="Compiling Molecular Fluid Model" />}>
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} intensity={3} castShadow penumbra={0.5} />
            <pointLight position={[-5, -5, -5]} intensity={1} color="#00f0ff" />
            <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1.5}>
              <FloatingFlask />
            </Float>
            <OrbitControls enableZoom={true} enablePan={false} minDistance={4} maxDistance={15} />
            <Environment preset="city" />
          </Canvas>
        </Suspense>
      </LocalErrorBoundary>
    </div>
  );
}

export function MagnifyingGlassViewer({ className }: { className?: string }) {
  const isSupported = checkWebGLSync();
  const fallback = <MagnifyingGlassPlaceholder />;

  if (!isSupported) {
    return <div className={className || "w-full h-full min-h-[400px]"}>{fallback}</div>;
  }

  return (
    <div className={className || "w-full h-full min-h-[400px] relative"}>
      <LocalErrorBoundary fallback={fallback}>
        <Suspense fallback={<ThreeDLoader text="Rendering Trace Lens" />}>
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} intensity={3} castShadow penumbra={0.5} />
            <pointLight position={[-5, -5, -5]} intensity={1} color="#00f0ff" />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
              <FloatingMagnifyingGlass />
            </Float>
            <OrbitControls enableZoom={true} enablePan={false} minDistance={4} maxDistance={15} />
            <Environment preset="city" />
          </Canvas>
        </Suspense>
      </LocalErrorBoundary>
    </div>
  );
}

export function MicroscopeViewer({ className }: { className?: string }) {
  const isSupported = checkWebGLSync();
  const fallback = <MicroscopePlaceholder />;

  if (!isSupported) {
    return <div className={className || "w-full h-full min-h-[400px]"}>{fallback}</div>;
  }

  return (
    <div className={className || "w-full h-full min-h-[400px] relative"}>
      <LocalErrorBoundary fallback={fallback}>
        <Suspense fallback={<ThreeDLoader text="Calibrating Laser Resolution" />}>
          <Canvas camera={{ position: [0, 1, 8], fov: 45 }} gl={{ alpha: true }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} intensity={3} castShadow penumbra={0.5} />
            <pointLight position={[-5, -5, -5]} intensity={1} color="#00f0ff" />
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
              <FloatingMicroscope />
            </Float>
            <OrbitControls enableZoom={true} enablePan={false} minDistance={4} maxDistance={15} />
            <Environment preset="city" />
          </Canvas>
        </Suspense>
      </LocalErrorBoundary>
    </div>
  );
}
