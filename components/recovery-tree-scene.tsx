'use client';

import { type TreeStage } from '@/lib/recovery-tree';

interface Props {
  stage: TreeStage;
  className?: string;
}

const VB_W = 400;
const VB_H = 280;
const GROUND_Y = 230;

// Fixed (non-random) position tables so server-rendered and hydrated markup
// always match exactly — no Math.random() during render.
const GRASS_X = [20, 45, 70, 95, 120, 150, 180, 210, 240, 270, 300, 330, 360, 380, 35, 110, 200, 290, 350, 60];
const FIREFLY_POS: [number, number][] = [[60, 150], [120, 100], [310, 130], [350, 170], [200, 90], [260, 160]];
const SPORE_POS: [number, number][] = [[80, 40], [180, 30], [260, 60], [330, 35], [40, 70], [300, 90]];
const STAR_POS: [number, number][] = [[30, 20], [90, 15], [150, 30], [220, 18], [280, 25], [340, 12], [370, 40]];

const CANOPY_OFFSETS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  3: [[-0.55, 0.05], [0.55, 0.05], [0, -0.5]],
  4: [[-0.6, 0.1], [0.6, 0.1], [-0.3, -0.5], [0.3, -0.5]],
  5: [[-0.65, 0.15], [0.65, 0.15], [-0.35, -0.45], [0.35, -0.45], [0, -0.7]],
  6: [[-0.7, 0.2], [0.7, 0.2], [-0.4, -0.35], [0.4, -0.35], [-0.15, -0.7], [0.15, -0.7]],
  7: [[-0.75, 0.2], [0.75, 0.2], [-0.45, -0.3], [0.45, -0.3], [-0.2, -0.65], [0.2, -0.65], [0, -0.9]],
};

const ACCENT_COLOR: Record<TreeStage['accent'], string> = {
  seed: '#67e8f9', green: '#34d399', gold: '#fbbf24', legendary: '#ff2d9b', world: '#a78bfa',
};

export function RecoveryTreeScene({ stage, className }: Props) {
  const treeX = VB_W / 2;
  const trunkH = stage.trunkHeight * 1.6;
  const trunkW = Math.max(2, stage.trunkWidth * 1.3);
  const canopyCx = treeX;
  const canopyCy = GROUND_Y - trunkH;
  const canopyR = Math.max(8, stage.canopyRadius * 1.3);
  const color = ACCENT_COLOR[stage.accent];
  const lobes = CANOPY_OFFSETS[stage.canopyCount] ?? [];
  const isDark = stage.accent === 'gold' || stage.accent === 'legendary' || stage.accent === 'world';

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className={className}
      role="img"
      aria-label={`Recovery tree scene at the ${stage.name} stage`}
      style={{ width: '100%', height: 'auto' }}
    >
      <style>{`
        @keyframes rt-sway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
        @keyframes rt-flicker { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }
        @keyframes rt-drift-up { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-60px); opacity: 0; } }
        @keyframes rt-fall { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 0.9; } 100% { transform: translateY(80px); opacity: 0; } }
        @keyframes rt-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes rt-flutter { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(8px,-6px) rotate(10deg); } }
        @keyframes rt-twinkle { 0%,100% { opacity: 0.3; } 50% { opacity: 0.9; } }
        @keyframes rt-aurora { 0%,100% { transform: translateX(0); } 50% { transform: translateX(12px); } }
        @media (prefers-reduced-motion: reduce) {
          .rt-anim { animation: none !important; }
        }
      `}</style>

      <defs>
        <linearGradient id={`rt-sky-${stage.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stage.sky[0]} />
          <stop offset="100%" stopColor={stage.sky[1]} />
        </linearGradient>
        <linearGradient id="rt-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f3a1f" />
          <stop offset="100%" stopColor="#0f1f0f" />
        </linearGradient>
        <filter id="rt-glow"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width={VB_W} height={VB_H} fill={`url(#rt-sky-${stage.id})`} />

      {/* Stars (dark-sky stages only) */}
      {isDark && STAR_POS.map(([x, y], i) => (
        <circle key={`star-${i}`} cx={x} cy={y} r="1.3" fill="#fff" className="rt-anim" style={{ animation: `rt-twinkle ${2 + (i % 3)}s ease-in-out infinite` }} />
      ))}

      {/* Aurora ribbons */}
      {stage.particles.includes('aurora') && (
        <g opacity="0.35" className="rt-anim" style={{ animation: 'rt-aurora 6s ease-in-out infinite' }}>
          <path d="M0,50 Q100,20 200,55 T400,40" stroke="#5eead4" strokeWidth="10" fill="none" />
          <path d="M0,70 Q120,45 240,75 T400,65" stroke="#a78bfa" strokeWidth="8" fill="none" />
        </g>
      )}

      {/* Ocean horizon (World Tree only) */}
      {stage.id === 'world-tree' && (
        <rect x="0" y={GROUND_Y - 14} width={VB_W} height="14" fill="#1a3a5a" opacity="0.5" />
      )}

      {/* Ground */}
      <rect x="0" y={GROUND_Y} width={VB_W} height={VB_H - GROUND_Y} fill="url(#rt-ground)" />

      {/* Grass */}
      {GRASS_X.slice(0, stage.grassDensity * 4).map((x, i) => (
        <line
          key={`grass-${i}`} x1={x} y1={GROUND_Y} x2={x} y2={GROUND_Y - 8 - (i % 3) * 2}
          stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"
          className="rt-anim" style={{ animation: `rt-sway ${2.5 + (i % 4) * 0.4}s ease-in-out infinite`, transformOrigin: `${x}px ${GROUND_Y}px` }}
        />
      ))}

      {/* Water */}
      {stage.water === 'stream' && (
        <path d={`M0,${GROUND_Y + 10} Q${VB_W * 0.3},${GROUND_Y + 4} ${VB_W * 0.5},${GROUND_Y + 12} T${VB_W},${GROUND_Y + 6}`} stroke="#38bdf8" strokeWidth="4" fill="none" opacity="0.7" />
      )}
      {stage.water === 'waterfall' && (
        <>
          <path d={`M0,${GROUND_Y + 10} Q${VB_W * 0.3},${GROUND_Y + 4} ${VB_W * 0.5},${GROUND_Y + 12} T${VB_W},${GROUND_Y + 6}`} stroke="#38bdf8" strokeWidth="5" fill="none" opacity="0.8" />
          <rect x={treeX + canopyR + 18} y={GROUND_Y - 50} width="6" height="50" fill="#7dd3fc" opacity="0.6" />
        </>
      )}

      {/* Roots */}
      {stage.hasRoots && (
        <g stroke={stage.rootsGlow ? '#a78bfa' : color} strokeOpacity={stage.rootsGlow ? 0.8 : 0.35} strokeWidth={Math.max(1.5, trunkW * 0.3)} fill="none">
          <path d={`M${canopyCx} ${GROUND_Y} q ${-trunkW * 2} 6 ${-trunkW * 4} 10`} className={stage.rootsGlow ? 'rt-anim' : undefined} style={stage.rootsGlow ? { animation: 'rt-flicker 3s ease-in-out infinite' } : undefined} />
          <path d={`M${canopyCx} ${GROUND_Y} q ${trunkW * 2} 6 ${trunkW * 4} 10`} className={stage.rootsGlow ? 'rt-anim' : undefined} style={stage.rootsGlow ? { animation: 'rt-flicker 3.4s ease-in-out infinite' } : undefined} />
        </g>
      )}

      {/* Seed stage: single dot, nothing else */}
      {stage.canopyCount === 0 ? (
        <circle cx={treeX} cy={GROUND_Y - 4} r="5" fill={color} />
      ) : (
        <>
          <rect x={canopyCx - trunkW / 2} y={GROUND_Y - trunkH} width={trunkW} height={trunkH} rx={trunkW / 2.5} fill="#a16207" />
          {stage.glow && (
            <g filter="url(#rt-glow)" opacity="0.7">
              {lobes.map(([dx, dy], i) => (
                <circle key={`glow-${i}`} cx={canopyCx + dx * canopyR} cy={canopyCy + dy * canopyR} r={canopyR * 0.75} fill={color} />
              ))}
            </g>
          )}
          <g>
            {lobes.map(([dx, dy], i) => (
              <circle key={i} cx={canopyCx + dx * canopyR} cy={canopyCy + dy * canopyR} r={canopyR * 0.62} fill={color} fillOpacity="0.88" />
            ))}
          </g>
          {stage.hasBlossoms && lobes.map(([dx, dy], i) => (
            <circle key={`b-${i}`} cx={canopyCx + dx * canopyR * 1.15} cy={canopyCy + dy * canopyR * 1.15} r={Math.max(2, canopyR * 0.1)} fill="#ff2d9b" />
          ))}
          {stage.bioluminescent && lobes.map(([dx, dy], i) => (
            <circle
              key={`gl-${i}`} cx={canopyCx + dx * canopyR * 0.7} cy={canopyCy + dy * canopyR * 0.7} r="2"
              fill="#5eead4" className="rt-anim" style={{ animation: `rt-flicker ${1.8 + (i % 3) * 0.5}s ease-in-out infinite` }}
            />
          ))}
        </>
      )}

      {/* Creatures */}
      {stage.creatures.includes('butterfly') && (
        <g className="rt-anim" style={{ animation: 'rt-flutter 3s ease-in-out infinite' }} transform={`translate(${treeX - canopyR - 20}, ${canopyCy - 10})`}>
          <ellipse cx="-3" cy="0" rx="4" ry="3" fill="#fb923c" />
          <ellipse cx="3" cy="0" rx="4" ry="3" fill="#fb923c" />
        </g>
      )}
      {stage.creatures.includes('butterfly2') && (
        <g className="rt-anim" style={{ animation: 'rt-flutter 2.4s ease-in-out infinite reverse' }} transform={`translate(${treeX + canopyR + 16}, ${canopyCy + 6})`}>
          <ellipse cx="-3" cy="0" rx="3.5" ry="2.5" fill="#67e8f9" />
          <ellipse cx="3" cy="0" rx="3.5" ry="2.5" fill="#67e8f9" />
        </g>
      )}
      {stage.creatures.includes('bird') && (
        <g className="rt-anim" style={{ animation: 'rt-bob 2.2s ease-in-out infinite' }} transform={`translate(${treeX - 70}, 50)`}>
          <path d="M-6,0 Q0,-5 6,0" stroke="#1f2937" strokeWidth="1.6" fill="none" />
        </g>
      )}
      {stage.creatures.includes('bird2') && (
        <g className="rt-anim" style={{ animation: 'rt-bob 2.6s ease-in-out infinite' }} transform={`translate(${treeX + 60}, 35)`}>
          <path d="M-6,0 Q0,-5 6,0" stroke="#1f2937" strokeWidth="1.6" fill="none" />
        </g>
      )}
      {stage.creatures.includes('deer') && (
        <g className="rt-anim" style={{ animation: 'rt-bob 4s ease-in-out infinite' }} transform={`translate(${treeX - canopyR - 50}, ${GROUND_Y - 20})`}>
          <rect x="-10" y="0" width="20" height="10" rx="4" fill="#92400e" />
          <rect x="-8" y="8" width="2.5" height="9" fill="#78350f" />
          <rect x="5" y="8" width="2.5" height="9" fill="#78350f" />
          <circle cx="11" cy="-3" r="4" fill="#92400e" />
        </g>
      )}

      {/* Fireflies */}
      {stage.particles.includes('fireflies') && FIREFLY_POS.map(([x, y], i) => (
        <circle key={`ff-${i}`} cx={x} cy={y} r="2" fill="#fde68a" className="rt-anim" style={{ animation: `rt-flicker ${1.5 + (i % 4) * 0.4}s ease-in-out infinite` }} />
      ))}

      {/* Floating lanterns */}
      {stage.particles.includes('lanterns') && [0, 1, 2].map((i) => (
        <ellipse
          key={`lan-${i}`} cx={treeX - 60 + i * 60} cy={GROUND_Y - 30} rx="5" ry="7" fill="#fbbf24" opacity="0.85"
          className="rt-anim" style={{ animation: `rt-drift-up ${6 + i}s ease-in linear infinite`, animationDelay: `${i * 1.6}s` }}
        />
      ))}

      {/* Falling spores (World Tree) */}
      {stage.particles.includes('spores') && SPORE_POS.map(([x, y], i) => (
        <circle key={`sp-${i}`} cx={x} cy={y} r="1.6" fill="#e0f2fe" className="rt-anim" style={{ animation: `rt-fall ${5 + (i % 3)}s ease-in linear infinite`, animationDelay: `${i * 0.7}s` }} />
      ))}
    </svg>
  );
}
