import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

function hashToNumbers(input, count = 12) {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  const arr = [];
  for (let i = 0; i < count; i++) {
    h ^= h >>> 16; h = Math.imul(h, 2246822507);
    h ^= h >>> 13; h = Math.imul(h, 3266489909);
    h ^= h >>> 16;
    arr.push(Math.abs(h >>> 0) / 2 ** 32);
  }
  return arr;
}

function buildSigilPath(seedValues) {
  const cx = 150, cy = 150, r = 110;
  const pts = seedValues.map((v, i) => {
    const a = v * Math.PI * 2;
    const rr = r * (0.5 + (seedValues[(i + 3) % seedValues.length] * 0.5));
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    d += ` Q ${cx} ${cy} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  }
  d += ' Z';
  return d;
}

export default function FlameKey({ sourceText = '' }) {
  const seeds = useMemo(() => hashToNumbers(sourceText || 'universal-guard-trust'), [sourceText]);
  const path = useMemo(() => buildSigilPath(seeds), [seeds]);

  const hue = Math.floor(seeds[0] * 360);
  const colorA = `hsl(${hue}, 85%, 65%)`;
  const colorB = `hsl(${(hue + 60) % 360}, 80%, 55%)`;

  const download = () => {
    const svg = document.getElementById('flame-key-svg');
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flame-key.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-slate-950 to-black text-white px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-semibold">
          Your Flame Key
        </motion.h2>
        <p className="mt-2 text-indigo-200/70">An animated sigil woven from your words.</p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mt-10 inline-block rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
          <svg
            id="flame-key-svg"
            width="320"
            height="320"
            viewBox="0 0 300 300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="g" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor={colorA} stopOpacity="0.95" />
                <stop offset="70%" stopColor={colorB} stopOpacity="0.6" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect x="0" y="0" width="300" height="300" fill="#000000" />
            <circle cx="150" cy="150" r="120" fill="url(#g)" opacity="0.35" />
            <g filter="url(#glow)">
              <animateTransform attributeName="transform" type="rotate" from="0 150 150" to="360 150 150" dur="18s" repeatCount="indefinite" />
              <path d={path} fill="none" stroke={colorA} strokeWidth="2.2" />
              <path d={path} fill="none" stroke={colorB} strokeWidth="1" opacity="0.6">
                <animate attributeName="stroke-dasharray" values="2,8; 8,2; 2,8" dur="6s" repeatCount="indefinite" />
              </path>
            </g>
          </svg>
        </motion.div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={download} className="rounded-full bg-white/10 px-5 py-2.5 border border-white/15 hover:bg-white/15">Download SVG</button>
        </div>
      </div>
    </div>
  );
}
