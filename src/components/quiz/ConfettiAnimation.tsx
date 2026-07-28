import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  angle: number;
  scale: number;
  delay: number;
  duration: number;
  rotation: number;
}

const PALETTE = [
  '#f59e0b', // amber-500
  '#fbbf24', // amber-400
  '#eab308', // yellow-500
  '#facc15', // yellow-400
  '#10b981', // emerald-500
  '#34d399', // emerald-400
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
];

export function ConfettiAnimation() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    // Generate confetti pieces on mount
    const newPieces: ConfettiPiece[] = Array.from({ length: 80 }).map((_, i) => {
      const angle = Math.random() * 360;
      const distance = Math.random() * 150 + 50;
      // Calculate initial burst direction
      const radians = (angle * Math.PI) / 180;
      const targetX = Math.cos(radians) * distance * (Math.random() * 1.5 + 0.5);
      const targetY = Math.sin(radians) * distance * (Math.random() * 1.5 + 0.5) - 100; // push up slightly

      const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];

      return {
        id: i,
        x: targetX,
        y: targetY,
        size: Math.random() * 8 + 6,
        color,
        shape,
        angle,
        scale: Math.random() * 0.6 + 0.4,
        delay: Math.random() * 0.2,
        duration: Math.random() * 2 + 2,
        rotation: Math.random() * 720 - 360,
      };
    });

    setPieces(newPieces);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {pieces.map((p) => {
        const shapeStyle =
          p.shape === 'circle'
            ? 'rounded-full'
            : p.shape === 'triangle'
            ? 'w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px]'
            : '';

        return (
          <motion.div
            key={p.id}
            initial={{
              x: '0vw',
              y: '0vh',
              scale: 0,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              x: [`0px`, `${p.x}px`, `${p.x + (p.x > 0 ? 50 : -50)}px`],
              y: [`0px`, `${p.y}px`, `${p.y + 450}px`],
              scale: [0, p.scale, p.scale * 0.5, 0],
              rotate: [0, p.rotation / 2, p.rotation],
              opacity: [1, 1, 0.8, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.1, 0.8, 0.3, 1], // Custom curve for initial burst and gravity fall
            }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '25%',
              width: p.shape === 'triangle' ? 0 : p.size,
              height: p.shape === 'triangle' ? 0 : p.size,
              backgroundColor: p.shape === 'triangle' ? 'transparent' : p.color,
              borderBottomColor: p.shape === 'triangle' ? p.color : undefined,
              zIndex: 30,
            }}
            className={shapeStyle}
          />
        );
      })}
    </div>
  );
}
