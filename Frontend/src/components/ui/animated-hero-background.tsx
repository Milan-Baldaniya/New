import React, { useEffect, useRef } from 'react';

interface AnimatedHeroBackgroundProps {
  className?: string;
}

const AnimatedHeroBackground: React.FC<AnimatedHeroBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Particle properties
    interface Particle {
      x: number;
      y: number;
      size: number;
      speed: number;
      color: string;
      opacity: number;
      direction: number;
    }
    
    // Create particles
    const particles: Particle[] = [];
    const particleCount = Math.min(100, Math.floor(window.innerWidth / 20));
    
    const colors = [
      'rgba(102, 187, 106, alpha)', // Green
      'rgba(33, 150, 243, alpha)',  // Blue
      'rgba(255, 193, 7, alpha)',   // Yellow
      'rgba(156, 39, 176, alpha)'   // Purple
    ];
    
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 5 + 1;
      const speed = Math.random() * 1 + 0.2;
      const opacity = Math.random() * 0.5 + 0.1;
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex].replace('alpha', opacity.toString());
      
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size,
        speed,
        color,
        opacity,
        direction: Math.random() * 360
      });
    }
    
    let animationFrameId: number;
    let frame = 0;
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      
      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const time = Date.now() * 0.0005;
      
      gradient.addColorStop(0, `rgba(25, 25, 35, 1)`);
      gradient.addColorStop(1, `rgba(45, 45, 85, 1)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      
      const gridSize = 50;
      const perspective = 500;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Draw radial lines
      for (let angle = 0; angle < 360; angle += 30) {
        const radians = (angle) * Math.PI / 180;
        const x = centerX + Math.cos(radians) * canvas.width;
        const y = centerY + Math.sin(radians) * canvas.height;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      
      // Draw concentric circles
      for (let r = 50; r < Math.max(canvas.width, canvas.height); r += 100) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      // Draw particles
      particles.forEach(particle => {
        // Move the particle
        const radians = particle.direction * Math.PI / 180;
        particle.x += Math.cos(radians) * particle.speed;
        particle.y += Math.sin(radians) * particle.speed;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.direction = 180 - particle.direction;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.direction = 360 - particle.direction;
        }
        
        // Draw the particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Draw glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, particle.size * 0.5,
          particle.x, particle.y, particle.size * 3
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connections between nearby particles
        particles.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
      
      // Create a wave effect at the bottom
      ctx.beginPath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      
      const waveHeight = 20;
      const waveCount = Math.ceil(canvas.width / 50);
      const baseY = canvas.height - 50;
      
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = baseY + Math.sin(x * 0.03 + time) * waveHeight;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className || ''}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default AnimatedHeroBackground; 