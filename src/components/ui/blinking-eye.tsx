import { useEffect, useState } from 'react';
import { Eye, EyeClosed } from 'lucide-react';

interface BlinkingEyeProps {
  size?: number;
  className?: string;
}

export function BlinkingEye({ size = 120, className = '' }: BlinkingEyeProps) {
  const [isOpen, setIsOpen] = useState(false); // Start with eyes closed

  useEffect(() => {
    // Open eyes after a short delay when component mounts
    const initialOpen = setTimeout(() => setIsOpen(true), 500);

    // Then blink periodically
    const blinkInterval = setInterval(() => {
      setIsOpen(false);
      setTimeout(() => setIsOpen(true), 200); // Closed for 200ms
    }, 2500 + Math.random() * 1500); // Random blink between 2.5-4 seconds

    return () => {
      clearTimeout(initialOpen);
      clearInterval(blinkInterval);
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Pulsing glow background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="rounded-full bg-primary/20 blur-2xl animate-pulse"
          style={{ width: size * 0.8, height: size * 0.8 }}
        />
      </div>
      
      {/* Icon with smooth transition */}
      <div className="relative z-10 transition-all duration-150">
        {isOpen ? (
          <Eye 
            size={size} 
            className="text-primary drop-shadow-lg transition-transform duration-150 hover:scale-105" 
            strokeWidth={1.5}
          />
        ) : (
          <EyeClosed 
            size={size} 
            className="text-primary drop-shadow-lg transition-transform duration-150" 
            strokeWidth={1.5}
          />
        )}
      </div>
      
      {/* Subtle rotating ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="rounded-full border-2 border-primary/10 animate-spin"
          style={{ 
            width: size * 1.2, 
            height: size * 1.2,
            animationDuration: '8s'
          }}
        />
      </div>
    </div>
  );
}
