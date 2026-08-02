import React, { useState, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

export interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  rippleColor?: string;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  className = '',
  rippleColor = 'rgba(255, 255, 255, 0.4)',
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handlePointerDown = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now() + Math.random(),
    };

    setRipples((prev) => [...prev.slice(-4), newRipple]);

    if (onClick) {
      onClick(e);
    }
  };

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <button
      {...props}
      onClick={handlePointerDown}
      className={`relative overflow-hidden ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 w-full h-full pointer-events-none">
        {children}
      </span>
      <span className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onAnimationComplete={() => removeRipple(ripple.id)}
              style={{
                position: 'absolute',
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                borderRadius: '50%',
                backgroundColor: rippleColor,
                pointerEvents: 'none',
              }}
            />
          ))}
        </AnimatePresence>
      </span>
    </button>
  );
};

export interface RippleWrapperProps {
  children: React.ReactNode;
  className?: string;
  rippleColor?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export const RippleWrapper: React.FC<RippleWrapperProps> = ({
  children,
  className = '',
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  onClick,
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now() + Math.random(),
    };

    setRipples((prev) => [...prev.slice(-4), newRipple]);

    if (onClick) {
      onClick(e);
    }
  };

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
    >
      <div className="relative z-10 w-full h-full">{children}</div>
      <span className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onAnimationComplete={() => removeRipple(ripple.id)}
              style={{
                position: 'absolute',
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                borderRadius: '50%',
                backgroundColor: rippleColor,
                pointerEvents: 'none',
              }}
            />
          ))}
        </AnimatePresence>
      </span>
    </div>
  );
};
