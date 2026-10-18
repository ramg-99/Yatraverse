import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export function Globe({ className = 'h-full w-full' }) {
  const ref = useRef(null);

  useEffect(() => {
    let phi = 0;
    const canvas = ref.current;
    if (!canvas) return undefined;
    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 600,
      height: 600,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.08, 0.1, 0.22],
      markerColor: [1, 0.69, 0.18],
      glowColor: [0.18, 0.83, 0.75],
      markers: [
        { location: [19.07, 72.87], size: 0.06 },
        { location: [35.67, 139.65], size: 0.05 },
        { location: [38.72, -9.13], size: 0.05 },
        { location: [-33.92, 18.42], size: 0.05 },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.004;
      },
    });
    return () => globe.destroy();
  }, []);

  return <canvas ref={ref} className={className} style={{ width: 300, height: 300 }} aria-label="Rotating globe" />;
}
