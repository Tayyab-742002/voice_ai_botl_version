import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioLevel: number;
  isActive: boolean;
  className?: string;
}

export function AudioVisualizer({ audioLevel, isActive, className = '' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, width, height);

      if (isActive) {
        // Draw waveform bars
        const barCount = 20;
        const barWidth = width / barCount;
        const maxBarHeight = height * 0.8;
        
        ctx.fillStyle = audioLevel > 0.1 ? '#3b82f6' : '#d1d5db';
        
        for (let i = 0; i < barCount; i++) {
          const barHeight = Math.max(2, audioLevel * maxBarHeight * (0.5 + Math.random() * 0.5));
          const x = i * barWidth + barWidth * 0.2;
          const y = (height - barHeight) / 2;
          
          ctx.fillRect(x, y, barWidth * 0.6, barHeight);
        }
      } else {
        // Draw idle state
        const centerY = height / 2;
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioLevel, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={60}
      className={`rounded-lg border-2 ${isActive ? 'border-blue-300' : 'border-gray-200'} ${className}`}
    />
  );
}