import { createEffect, createSignal, For, Show } from 'solid-js';
import { Box, Typography, Paper } from '@suid/material';
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

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      p: 3 
    }}>
      <Box sx={{ position: 'relative', width: 400, height: 400 }}>
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
                    fill={isWinner ? '#4caf50' : (index() % 2 === 0 ? '#d32f2f' : '#f44336')}
                    stroke="white"
                    stroke-width="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    font-size="14"
                    font-weight="bold"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                  >
                    {person.name.split(' ')[0]}
                  </text>
                </g>
              );
            }}
          </For>
        </svg>

        {/* Center circle */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'white',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <Typography variant="h6" color="primary">
            BNI
          </Typography>
        </Box>

        {/* Pointer */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderTop: '40px solid #333',
            zIndex: 20,
          }}
        />
      </Box>

      {/* Winner display */}
      <Show when={!props.isSpinning && props.winner}>
        <Paper 
          elevation={3}
          sx={{ 
            mt: 4, 
            p: 3, 
            textAlign: 'center',
            bgcolor: '#4caf50',
            color: 'white',
            animation: 'pulse 1s infinite',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Félicitations !
          </Typography>
          <Typography variant="h3">
            {props.winner?.name}
          </Typography>
        </Paper>
      </Show>
    </Box>
  );
}

export default RouletteWheel;