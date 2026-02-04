
import React from 'react';
import { CircuitType, CircuitData } from '../types';

interface Props {
  circuit: CircuitData;
  showCurrent?: boolean;
}

const CircuitRenderer: React.FC<Props> = ({ circuit, showCurrent = true }) => {
  const { type, resistors, voltage } = circuit;

  const renderResistor = (x: number, y: number, label: string, val: number, vertical = false) => {
    return (
      <g key={label} transform={`translate(${x}, ${y}) ${vertical ? 'rotate(90)' : ''}`}>
        {/* Zigzag line for resistor */}
        <polyline
          points="-20,0 -15,-10 -5,10 5,-10 15,10 20,0"
          fill="none"
          stroke="white"
          strokeWidth="3"
        />
        {/* Label and Value - Larger and more prominent */}
        <g transform={vertical ? 'rotate(-90)' : ''}>
           <text 
             x="0" 
             y="-30" 
             fill="white" 
             textAnchor="middle" 
             fontSize="18" 
             className="font-black drop-shadow-md"
             style={{ paintOrder: 'stroke', stroke: '#020617', strokeWidth: '4px', strokeLinejoin: 'round' }}
           >
            {label}: {val}Ω
          </text>
        </g>
      </g>
    );
  };

  const renderBattery = (x: number, y: number, val: number) => (
    <g transform={`translate(${x}, ${y})`}>
      <line x1="-10" y1="-15" x2="-10" y2="15" stroke="#ff0000" strokeWidth="5" />
      <line x1="10" y1="-25" x2="10" y2="25" stroke="#ff0000" strokeWidth="5" />
      <text 
        x="0" 
        y="50" 
        fill="#ff0000" 
        textAnchor="middle" 
        fontSize="22" 
        className="font-black drop-shadow-lg"
        style={{ paintOrder: 'stroke', stroke: '#020617', strokeWidth: '5px', strokeLinejoin: 'round' }}
      >
        {val}V
      </text>
    </g>
  );

  return (
    <div className="w-full bg-slate-900 rounded-xl p-8 flex justify-center items-center shadow-2xl border border-blue-900 overflow-hidden">
      <svg viewBox="0 0 500 300" className="w-full h-auto max-w-[600px]">
        {/* Main Circuit Loop */}
        <path
          d={type === CircuitType.SERIES 
            ? "M 100,50 L 400,50 L 400,250 L 100,250 Z" 
            : type === CircuitType.PARALLEL 
            ? "M 100,50 L 400,50 L 400,250 L 100,250 Z M 250,50 L 250,250" 
            : "M 100,50 L 300,50 L 400,50 L 400,250 L 300,250 L 100,250 Z M 300,50 L 300,250"}
          fill="none"
          stroke="#475569"
          strokeWidth="6"
        />
        
        {/* Animated Current Path */}
        {showCurrent && (
          <path
            d={type === CircuitType.SERIES 
              ? "M 100,50 L 400,50 L 400,250 L 100,250 Z" 
              : "M 100,50 L 400,50 L 400,250 L 100,250 Z"}
            fill="none"
            stroke="#ff0000"
            strokeWidth="3"
            className="circuit-path"
            opacity="0.8"
          />
        )}

        {/* Components */}
        {renderBattery(100, 150, voltage)}

        {type === CircuitType.SERIES && (
          <>
            {renderResistor(250, 50, resistors[0].label, resistors[0].resistance)}
            {renderResistor(400, 150, resistors[1].label, resistors[1].resistance, true)}
            {resistors[2] && renderResistor(250, 250, resistors[2].label, resistors[2].resistance)}
          </>
        )}

        {type === CircuitType.PARALLEL && (
          <>
            {renderResistor(250, 150, resistors[0].label, resistors[0].resistance, true)}
            {renderResistor(400, 150, resistors[1].label, resistors[1].resistance, true)}
          </>
        )}

        {type === CircuitType.COMBINATION && (
          <>
            {renderResistor(200, 50, resistors[0].label, resistors[0].resistance)}
            {renderResistor(300, 150, resistors[1].label, resistors[1].resistance, true)}
            {renderResistor(400, 150, resistors[2].label, resistors[2].resistance, true)}
          </>
        )}
      </svg>
    </div>
  );
};

export default CircuitRenderer;
