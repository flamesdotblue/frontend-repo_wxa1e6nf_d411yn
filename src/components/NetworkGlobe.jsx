import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function project(lat, lon, radius, rotation) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + rotation) * (Math.PI / 180);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  // simple perspective
  const scale = 200 / (z + radius + 200);
  return { x: x * scale, y: y * scale, z, scale };
}

export default function NetworkGlobe() {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;

    const nodes = Array.from({ length: 48 }).map((_, i) => ({
      lat: -60 + (i * 7.5) % 120,
      lon: (i * 37) % 360,
      strength: 0.5 + Math.sin(i * 1.234) * 0.5,
    }));

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.translate(w / 2, h / 2);

      const r = Math.min(w, h) * 0.33;
      rotationRef.current += 0.2;

      // globe
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      const grd = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
      grd.addColorStop(0, 'rgba(99,102,241,0.25)');
      grd.addColorStop(1, 'rgba(0,0,0,0.0)');
      ctx.fillStyle = grd;
      ctx.fill();

      // meridians
      ctx.strokeStyle = 'rgba(148,163,184,0.25)';
      ctx.lineWidth = 1;
      for (let i = -60; i <= 60; i += 30) {
        ctx.beginPath();
        for (let j = 0; j <= 360; j += 4) {
          const p = project(i, j, r, rotationRef.current);
          if (j === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // nodes
      nodes.forEach((n, idx) => {
        const p = project(n.lat, n.lon, r, rotationRef.current);
        const alpha = 0.3 + 0.7 * Math.max(0, p.z / (r));
        const s = 2 + 3 * (n.strength * p.scale);
        ctx.beginPath();
        ctx.fillStyle = `rgba(250, 204, 21, ${alpha.toFixed(3)})`;
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white px-6 py-16">
      <div className="mx-auto max-w-5xl text-center">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-semibold">
          Universal Network
        </motion.h2>
        <p className="mt-2 text-indigo-200/70">Guardian nodes humming across the world.</p>

        <div className="mt-10 mx-auto w-full h-[420px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
