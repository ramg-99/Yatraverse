import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/store/useThemeStore.js';

const STARS = 70;

export function ConstellationBg() {
  const ref = useRef(null);
  const themeStyle = useThemeStore((s) => s.themeStyle);
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    if (themeStyle !== 'classic') return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    const mouse = { x: 0.5, y: 0.5 };
    const stars = Array.from({ length: STARS }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
    }));

    const resize = () => {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    const onMove = (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = mode === 'light' ? 'rgba(15,23,42,0.4)' : 'rgba(246,241,231,0.7)';
      stars.forEach((s) => {
        const px = s.x * w + (mouse.x - 0.5) * 18;
        const py = s.y * h + (mouse.y - 0.5) * 18;
        ctx.beginPath();
        ctx.arc(px, py, s.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.strokeStyle = mode === 'light' ? 'rgba(2,132,199,0.12)' : 'rgba(45,212,191,0.18)';
      ctx.lineWidth = 1;
      for (let i = 0; i < stars.length; i += 1) {
        for (let j = i + 1; j < stars.length; j += 1) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          if (dx * dx + dy * dy < 0.018) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x * w, stars[i].y * h);
            ctx.lineTo(stars[j].x * w, stars[j].y * h);
            ctx.stroke();
          }
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, [themeStyle, mode]);

  if (themeStyle === 'modern') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        {mode === 'light' ? (
          <>
            <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-sky-200/40 via-teal-100/30 to-transparent blur-3xl" />
            <div className="absolute top-1/2 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-100/30 via-sky-100/20 to-transparent blur-3xl" />
          </>
        ) : (
          <>
            <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-sky-500/10 via-cyan-500/5 to-transparent blur-3xl" />
            <div className="absolute top-1/2 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-blue-600/10 via-teal-500/5 to-transparent blur-3xl" />
          </>
        )}
      </div>
    );
  }

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0 opacity-40" aria-hidden />;
}

