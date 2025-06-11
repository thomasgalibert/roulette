import { createEffect, createSignal, For, Show } from 'solid-js';
import type { Person } from '../types/index';
import './RouletteWheel.css';

interface RouletteWheelProps {
  persons: Person[];
  isSpinning: boolean;
  winner: Person | null;
}

function RouletteWheel(props: RouletteWheelProps) {
  const [rotation, setRotation] = createSignal(0);

  let spinInterval: number | undefined;

  createEffect(() => {
    if (props.isSpinning) {
      // Start spinning
      spinInterval = setInterval(() => {
        setRotation(r => r + 15);
      }, 30);
    } else {
      // Stop spinning
      if (spinInterval) {
        clearInterval(spinInterval);
        spinInterval = undefined;
      }
      
      if (props.winner) {
        // Find winner index and set final rotation
        const winnerIndex = props.persons.findIndex(p => p.id === props.winner!.id);
        if (winnerIndex !== -1) {
          const segmentAngle = 360 / props.persons.length;
          // The pointer is at the top (0°), so we need to rotate to align the winner's segment
          // We want the middle of the winner's segment to be at the top
          const targetAngle = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
          setRotation(3600 + targetAngle); // More rotations + final position
        }
      }
    }
  });

  // Cleanup on unmount
  createEffect(() => {
    return () => {
      if (spinInterval) {
        clearInterval(spinInterval);
      }
    };
  });

  const segmentAngle = () => 360 / props.persons.length;

  // Generate colors based on Material Design 3 palette
  const getSegmentColor = (index: number, isWinner: boolean) => {
    if (isWinner) {
      return 'var(--md-sys-color-tertiary)';
    }
    // Alternate between primary and secondary container colors
    return index % 2 === 0 
      ? 'var(--md-sys-color-primary)' 
      : 'var(--md-sys-color-primary-container)';
  };

  const getTextColor = (index: number, isWinner: boolean) => {
    if (isWinner) {
      return 'var(--md-sys-color-on-tertiary)';
    }
    return index % 2 === 0 
      ? 'var(--md-sys-color-on-primary)' 
      : 'var(--md-sys-color-on-primary-container)';
  };

  return (
    <div style={{ 
      display: 'flex', 
      'flex-direction': 'column', 
      'align-items': 'center', 
      padding: '24px' 
    }}>
      <div style={{ position: 'relative', width: '400px', height: '400px' }}>
        {/* Roulette wheel */}
        <svg
          width="400"
          height="400"
          style={{
            transform: `rotate(${rotation()}deg)`,
            transition: props.isSpinning ? 'none' : 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)',
          }}
        >
          <For each={props.persons}>
            {(person, index) => {
              const angle = segmentAngle();
              const startAngle = index() * angle;
              const endAngle = startAngle + angle;
              const isWinner = !props.isSpinning && props.winner?.id === person.id;
              
              // Convert to radians
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              
              // Calculate path
              const largeArcFlag = angle > 180 ? 1 : 0;
              const x1 = 200 + 200 * Math.cos(startRad);
              const y1 = 200 + 200 * Math.sin(startRad);
              const x2 = 200 + 200 * Math.cos(endRad);
              const y2 = 200 + 200 * Math.sin(endRad);
              
              const pathData = `M 200 200 L ${x1} ${y1} A 200 200 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              // Calculate text position
              const textAngle = startAngle + angle / 2;
              const textRad = (textAngle * Math.PI) / 180;
              const textX = 200 + 120 * Math.cos(textRad);
              const textY = 200 + 120 * Math.sin(textRad);
              
              return (
                <g>
                  <path
                    d={pathData}
                    fill={getSegmentColor(index(), isWinner)}
                    stroke="var(--md-sys-color-surface)"
                    stroke-width="2"
                    style={{
                      transition: 'fill 0.3s ease'
                    }}
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill={getTextColor(index(), isWinner)}
                    font-size="14"
                    font-weight="500"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                    style={{
                      'font-family': 'var(--md-sys-typescale-font-family-plain)',
                      transition: 'fill 0.3s ease'
                    }}
                  >
                    {person.name.split(' ')[0]}
                  </text>
                </g>
              );
            }}
          </For>
        </svg>

        {/* Center circle */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px',
            height: '80px',
            'border-radius': '50%',
            'background-color': 'var(--md-sys-color-surface)',
            'box-shadow': 'var(--md-sys-elevation-3)',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'z-index': '10',
          }}
        >
          <span class="title-medium" style={{ color: 'var(--md-sys-color-primary)' }}>
            BNI
          </span>
        </div>

        {/* Pointer */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            'border-left': '20px solid transparent',
            'border-right': '20px solid transparent',
            'border-top': '40px solid var(--md-sys-color-primary)',
            'z-index': '20',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          }}
        />
      </div>

      {/* Winner display */}
      <Show when={!props.isSpinning && props.winner}>
        <div 
          class="md-card"
          style={{ 
            'margin-top': '32px',
            'text-align': 'center',
            'background-color': 'var(--md-sys-color-tertiary-container)',
            color: 'var(--md-sys-color-on-tertiary-container)',
            animation: 'pulse 1s infinite',
            'min-width': '300px',
          }}
        >
          <div class="md-card-content" style={{ padding: '24px' }}>
            <h3 class="headline-medium" style={{ 'margin-bottom': '8px' }}>
              Félicitations !
            </h3>
            <p class="display-small">
              {props.winner?.name}
            </p>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default RouletteWheel;