import { useEffect, useRef } from 'react';

export default function AtmosphericBackground({ accentColor, effects }) {
  const canvasRef = useRef(null);
  const accentRef = useRef(accentColor);
  const effectsRef = useRef(effects);

  useEffect(() => {
    accentRef.current = accentColor;
  }, [accentColor]);

  useEffect(() => {
    effectsRef.current = effects;
  }, [effects]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const rainCount = Math.min(130, Math.max(60, Math.floor(width / 12)));
    const fallingRain = Array.from({ length: rainCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: 12 + Math.random() * 18,
      speed: 8 + Math.random() * 7,
      alpha: 0.08 + Math.random() * 0.14,
    }));

    const dropCount = Math.min(75, Math.max(35, Math.floor(width / 22)));
    const windowDrops = Array.from({ length: dropCount }, () => {
      const moving = Math.random() < 0.35;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: moving ? 2.2 + Math.random() * 2.2 : 1 + Math.random() * 1.8,
        vy: moving ? 0.5 + Math.random() * 1.4 : 0,
        wobble: Math.random() * Math.PI * 2,
        moving,
        trail: [],
      };
    });

    let rockets = [];
    let sparks = [];
    let nextFireworkAt = performance.now() + 900;

    let lightningFlash = 0;
    let lightningBolt = [];
    let lightningGlowX = width * 0.5;
    let nextLightningAt = performance.now() + 1000 + Math.random() * 9000;

    function buildBolt(startX, startY, endY) {
      const segments = [];
      let cx = startX;
      let cy = startY;
      const steps = 10;
      const stepY = (endY - startY) / steps;

      for (let i = 0; i < steps; i++) {
        const nx = cx + (Math.random() - 0.5) * 65;
        const ny = cy + stepY;
        segments.push({ x1: cx, y1: cy, x2: nx, y2: ny, width: 2.2 - i * 0.12 });

        if (Math.random() < 0.38 && i > 1 && i < steps - 2) {
          const bx = nx + (Math.random() > 0.5 ? 1 : -1) * (35 + Math.random() * 45);
          const by = ny + stepY * (1.2 + Math.random());
          segments.push({ x1: nx, y1: ny, x2: bx, y2: by, width: 1.0 });
        }

        cx = nx;
        cy = ny;
      }
      return segments;
    }

    function launchFirework() {
      const palette = [accentRef.current, '#FBBF24', '#FDE68A', '#FB923C', '#F4F4F6'];
      const color = palette[Math.floor(Math.random() * palette.length)];
      rockets.push({
        x: width * (0.12 + Math.random() * 0.76),
        y: height + 10,
        vx: (Math.random() - 0.5) * 1.4,
        vy: -(7.5 + Math.random() * 3.5),
        targetY: height * (0.14 + Math.random() * 0.36),
        color,
      });
    }

    function burstFirework(x, y, primaryColor) {
      const count = 34 + Math.floor(Math.random() * 18);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.18;
        const speed = 1.4 + Math.random() * 3.6;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.014 + Math.random() * 0.012,
          color: i % 4 === 0 ? '#FFF7ED' : primaryColor,
          size: 1.4 + Math.random() * 1.6,
        });
      }
    }

    if (reducedMotion) {
      ctx.clearRect(0, 0, width, height);
      if (effectsRef.current.rain) {
        for (const d of windowDrops) {
          ctx.fillStyle = 'rgba(210, 222, 240, 0.14)';
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    let rafId;
    const render = (now) => {
      const active = effectsRef.current;
      ctx.clearRect(0, 0, width, height);

      if (!active.rain && !active.lightning && !active.fireworks) {
        rockets = [];
        sparks = [];
        lightningFlash = 0;
        rafId = window.requestAnimationFrame(render);
        return;
      }

      if (active.lightning) {
        if (now >= nextLightningAt) {
          lightningFlash = 0.85;
          lightningGlowX = width * (0.15 + Math.random() * 0.7);
          lightningBolt = buildBolt(lightningGlowX, 0, height * (0.45 + Math.random() * 0.3));
          nextLightningAt = now + 1000 + Math.random() * 9000;
        }
      } else {
        lightningFlash = 0;
        lightningBolt = [];
      }

      if (lightningFlash > 0.01) {
        const skyGrad = ctx.createRadialGradient(
          lightningGlowX,
          height * 0.15,
          10,
          lightningGlowX,
          height * 0.25,
          Math.max(width, height) * 0.65
        );
        skyGrad.addColorStop(0, `rgba(226, 236, 255, ${lightningFlash * 0.22})`);
        skyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.strokeStyle = `rgba(240, 246, 255, ${lightningFlash * 0.7})`;
        ctx.shadowColor = '#DBEAFE';
        ctx.shadowBlur = 18;
        ctx.lineCap = 'round';
        for (const seg of lightningBolt) {
          ctx.lineWidth = seg.width;
          ctx.beginPath();
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
          ctx.stroke();
        }
        ctx.restore();

        lightningFlash *= 0.86;
      }

      if (active.fireworks) {
        if (now >= nextFireworkAt) {
          launchFirework();
          nextFireworkAt = now + 1500 + Math.random() * 2200;
        }

        const nextRockets = [];
        for (const r of rockets) {
          r.x += r.vx;
          r.y += r.vy;
          r.vy += 0.06;

          ctx.save();
          ctx.fillStyle = r.color;
          ctx.shadowColor = r.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (r.y <= r.targetY || r.vy >= -0.5) {
            burstFirework(r.x, r.y, r.color);
          } else {
            nextRockets.push(r);
          }
        }
        rockets = nextRockets;

        const nextSparks = [];
        for (const sp of sparks) {
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vx *= 0.985;
          sp.vy = sp.vy * 0.985 + 0.045;
          sp.life -= sp.decay;

          if (sp.life > 0) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, sp.life * 0.72);
            ctx.fillStyle = sp.color;
            ctx.shadowColor = sp.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            nextSparks.push(sp);
          }
        }
        sparks = nextSparks;
      } else {
        rockets = [];
        sparks = [];
      }

      if (active.rain) {
        ctx.lineWidth = 1;
        for (const drop of fallingRain) {
          drop.x -= 1.2;
          drop.y += drop.speed;
          if (drop.y > height + 20) {
            drop.y = -20;
            drop.x = Math.random() * (width + 60);
          }

          ctx.strokeStyle = `rgba(195, 210, 232, ${drop.alpha + lightningFlash * 0.14})`;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + 2.4, drop.y - drop.len);
          ctx.stroke();
        }

        for (const d of windowDrops) {
          if (d.moving) {
            d.wobble += 0.04;
            d.x += Math.sin(d.wobble) * 0.25;
            d.y += d.vy;

            d.trail.push({ x: d.x, y: d.y });
            if (d.trail.length > 22) d.trail.shift();

            if (d.y > height + 15) {
              d.y = -10;
              d.x = Math.random() * width;
              d.trail = [];
            }

            if (d.trail.length > 1) {
              ctx.strokeStyle = 'rgba(205, 220, 240, 0.09)';
              ctx.lineWidth = d.r * 0.85;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(d.trail[0].x, d.trail[0].y);
              for (let i = 1; i < d.trail.length; i++) {
                ctx.lineTo(d.trail[i].x, d.trail[i].y);
              }
              ctx.stroke();
            }
          }

          ctx.fillStyle = `rgba(210, 225, 245, ${0.15 + lightningFlash * 0.12})`;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
          ctx.beginPath();
          ctx.arc(d.x - d.r * 0.28, d.y - d.r * 0.28, Math.max(0.5, d.r * 0.28), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 w-full h-full pointer-events-none"
    />
  );
}
