import React, { useRef, useState, useEffect, ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltMaxAngle?: number;
  glareMaxOpacity?: number;
  perspective?: number;
  scale?: number;
  transitionSpeed?: number;
  gyroscope?: boolean;
}

const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  tiltMaxAngle = 10,
  glareMaxOpacity = 0.3,
  perspective = 1000,
  scale = 1.05,
  transitionSpeed = 400,
  gyroscope = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [tiltValues, setTiltValues] = useState({ tiltX: 0, tiltY: 0, glareOpacity: 0, glareX: 50, glareY: 50 });

  // Handle mobile device orientation
  useEffect(() => {
    if (!gyroscope) return;
    
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (cardRef.current && event.beta && event.gamma) {
        const x = Math.min(Math.max(event.gamma, -tiltMaxAngle), tiltMaxAngle);
        const y = Math.min(Math.max(event.beta - 40, -tiltMaxAngle), tiltMaxAngle);
        
        // Normalize tilt values
        const tiltX = -(y / tiltMaxAngle);
        const tiltY = (x / tiltMaxAngle);
        
        // Calculate glare position
        const glareX = 50 + (tiltY * 50);
        const glareY = 50 + (tiltX * 50);
        const glareOpacity = glareMaxOpacity * Math.sqrt(tiltX * tiltX + tiltY * tiltY) / Math.sqrt(2);
        
        setTiltValues({
          tiltX: y,
          tiltY: x,
          glareOpacity,
          glareX,
          glareY
        });
      }
    };
    
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [gyroscope, tiltMaxAngle, glareMaxOpacity]);

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isHovering) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate tilt values based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = -((y - centerY) / centerY) * tiltMaxAngle;
    const tiltY = ((x - centerX) / centerX) * tiltMaxAngle;
    
    // Calculate glare position
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    const glareOpacity = glareMaxOpacity * Math.sqrt(tiltX * tiltX + tiltY * tiltY) / Math.sqrt(2);
    
    setTiltValues({ tiltX, tiltY, glareOpacity, glareX, glareY });
  };

  // Handle mouse enter/leave events
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTiltValues({ tiltX: 0, tiltY: 0, glareOpacity: 0, glareX: 50, glareY: 50 });
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovering
          ? `perspective(${perspective}px) rotateX(${tiltValues.tiltX}deg) rotateY(${tiltValues.tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: isHovering ? 'none' : `transform ${transitionSpeed}ms ease`,
        willChange: 'transform',
        transformStyle: 'preserve-3d'
      }}
    >
      {children}
      
      {/* Glare effect */}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${tiltValues.glareX}% ${tiltValues.glareY}%, rgba(255,255,255,${tiltValues.glareOpacity}) 0%, rgba(255,255,255,0) 60%)`,
          transform: 'translateZ(1px)',
          transition: isHovering ? 'none' : `opacity ${transitionSpeed}ms ease`,
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
};

export default TiltCard; 