'use client';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { type ReactNode, type CSSProperties } from 'react';

type Animation = 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale-up';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: Animation;
  delay?: number;
  duration?: number;
  threshold?: number;
}

const animations: Record<Animation, { initial: CSSProperties; visible: CSSProperties }> = {
  'fade-up': {
    initial: { opacity: 0, transform: 'translateY(30px)' },
    visible: { opacity: 1, transform: 'translateY(0)' },
  },
  'fade-in': {
    initial: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'fade-left': {
    initial: { opacity: 0, transform: 'translateX(-30px)' },
    visible: { opacity: 1, transform: 'translateX(0)' },
  },
  'fade-right': {
    initial: { opacity: 0, transform: 'translateX(30px)' },
    visible: { opacity: 1, transform: 'translateX(0)' },
  },
  'scale-up': {
    initial: { opacity: 0, transform: 'scale(0.95)' },
    visible: { opacity: 1, transform: 'scale(1)' },
  },
};

export function ScrollReveal({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.1,
}: ScrollRevealProps) {
  const { ref, isVisible, shouldAnimate } = useScrollAnimation({ threshold });

  // Before hydration or for above-fold elements: no animation styles
  if (!shouldAnimate) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  // Below-fold elements: apply animation
  const anim = animations[animation];
  const style: CSSProperties = isVisible
    ? {
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
        ...anim.visible,
      }
    : {
        // No transition on initial hide to prevent flash
        ...anim.initial,
      };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
