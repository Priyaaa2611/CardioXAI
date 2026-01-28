
import React, { useEffect, useRef } from 'react';

interface ECGWaveProps {
  className?: string;
  speed?: number;
}

const ECGWave: React.FC<ECGWaveProps> = ({ className, speed = 2 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      for (let x = 0; x < width; x++) {
        const relativeX = (x + offset) % 200;
        let y = centerY;

        // Simulate P-QRS-T complex
        if (relativeX < 10) y = centerY;
        else if (relativeX < 20) y = centerY - 5 * Math.sin((relativeX - 10) * Math.PI / 10); // P
        else if (relativeX < 30) y = centerY;
        else if (relativeX < 35) y = centerY + 10; // Q
        else if (relativeX < 40) y = centerY - 50; // R
        else if (relativeX < 45) y = centerY + 15; // S
        else if (relativeX < 55) y = centerY;
        else if (relativeX < 80) y = centerY - 15 * Math.sin((relativeX - 55) * Math.PI / 25); // T
        else y = centerY;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      offset += speed;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [speed]);

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={150} 
      className={`w-full h-32 opacity-80 ${className}`}
    />
  );
};

export default ECGWave;
