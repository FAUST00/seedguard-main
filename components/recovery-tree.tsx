'use client';

import { type TreeStage } from '@/lib/recovery-tree';

interface RecoveryTreeProps {
  stage: TreeStage;
  variant?: 'compact' | 'full';
  className?: string;
}

// Deterministic canopy-lobe offsets per lobe count, so the tree shape is
// stable across renders instead of randomized each time.
const LOBE_OFFSETS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  3: [[-0.55, 0.05], [0.55, 0.05], [0, -0.5]],
  4: [[-0.6, 0.1], [0.6, 0.1], [-0.3, -0.5], [0.3, -0.5]],
  5: [[-0.65, 0.15], [0.65, 0.15], [-0.35, -0.45], [0.35, -0.45], [0, -0.7]],
  6: [[-0.7, 0.2], [0.7, 0.2], [-0.4, -0.35], [0.4, -0.35], [-0.15, -0.7], [0.15, -0.7]],
  7: [[-0.75, 0.2], [0.75, 0.2], [-0.45, -0.3], [0.45, -0.3], [-0.2, -0.65], [0.2, -0.65], [0, -0.9]],
};

const ACCENT_COLOR: Record<TreeStage['accent'], string> = {
  seed: 'hsl(var(--secondary))',
  green: '#34d399',
  gold: 'hsl(var(--gold))',
  legendary: 'hsl(var(--primary))',
  world: '#a78bfa',
};

export function RecoveryTree({ stage, variant = 'compact', className }: RecoveryTreeProps) {
  const W = variant === 'compact' ? 140 : 280;
  const H = variant === 'compact' ? 150 : 300;
  const scale = variant === 'compact' ? 1 : 1.85;
  const groundY = H - 14;
  const trunkH = stage.trunkHeight * scale * 0.7;
  const trunkW = Math.max(2, stage.trunkWidth * scale * 0.6);
  const canopyCx = W / 2;
  const canopyCy = groundY - trunkH;
  const canopyR = Math.max(6, stage.canopyRadius * scale * 0.6);
  const color = ACCENT_COLOR[stage.accent];
  const lobes = LOBE_OFFSETS[stage.canopyCount] ?? [];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className={className}
      role="img"
      aria-label={`Recovery tree at the ${stage.name} stage`}
    >
      {/* Ground line */}
      <line x1={W * 0.15} y1={groundY} x2={W * 0.85} y2={groundY} stroke="hsl(var(--muted)/0.25)" strokeWidth="2" strokeLinecap="round" />

      {/* Roots */}
      {stage.hasRoots && (
        <g stroke={color} strokeOpacity="0.35" strokeWidth={Math.max(1.5, trunkW * 0.3)} fill="none" style={{ transition: 'all 0.8s ease' }}>
          <path d={`M ${canopyCx} ${groundY} q ${-trunkW * 1.4} 6 ${-trunkW * 2.2} 10`} />
          <path d={`M ${canopyCx} ${groundY} q ${trunkW * 1.4} 6 ${trunkW * 2.2} 10`} />
        </g>
      )}

      {/* Seed stage: a single dot at ground level, nothing else */}
      {stage.canopyCount === 0 ? (
        <circle
          cx={canopyCx} cy={groundY - 4} r={Math.max(4, stage.canopyRadius * scale * 0.4)}
          fill={color} style={{ transition: 'all 0.8s ease' }}
        />
      ) : (
        <>
          {/* Trunk */}
          <rect
            x={canopyCx - trunkW / 2} y={groundY - trunkH} width={trunkW} height={trunkH}
            rx={trunkW / 2.5} fill="hsl(var(--gold))" fillOpacity="0.55"
            style={{ transition: 'all 0.8s ease' }}
          />

          {/* Canopy lobes */}
          <g style={{ filter: stage.glow ? `drop-shadow(0 0 8px ${color})` : undefined, transition: 'all 0.8s ease' }}>
            {lobes.map(([dx, dy], i) => (
              <circle
                key={i}
                cx={canopyCx + dx * canopyR}
                cy={canopyCy + dy * canopyR}
                r={canopyR * 0.62}
                fill={color}
                fillOpacity={0.85}
                style={{ transition: 'all 0.8s ease' }}
              />
            ))}
          </g>

          {/* Blossoms */}
          {stage.hasBlossoms && lobes.map(([dx, dy], i) => (
            <circle
              key={`b-${i}`}
              cx={canopyCx + dx * canopyR * 1.15}
              cy={canopyCy + dy * canopyR * 1.15}
              r={Math.max(2, canopyR * 0.12)}
              fill="hsl(var(--primary))"
              style={{ transition: 'all 0.8s ease' }}
            />
          ))}
        </>
      )}
    </svg>
  );
}
