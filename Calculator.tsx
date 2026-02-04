
import React, { useState } from 'react';

interface Props {
  onClose: () => void;
}

const Calculator: React.FC<Props> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [shouldReset, setShouldReset] = useState(false);

  const handleDigit = (digit: string) => {
    if (display === '0' || shouldReset) {
      setDisplay(digit);
      setShouldReset(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOperator = (op: string) => {
    // If the user presses an operator immediately after another, just change the operator
    if (shouldReset && equation) {
      const parts = equation.trim().split(' ');
      if (parts.length >= 1) {
        setEquation(parts[0] + ' ' + op + ' ');
      }
      return;
    }

    // If there is already a pending operation, calculate the subtotal first (chained operations)
    if (equation) {
      try {
        const result = eval(equation + display);
        const resultStr = Number(result.toFixed(4)).toString();
        setDisplay(resultStr);
        setEquation(resultStr + ' ' + op + ' ');
      } catch (e) {
        setEquation(display + ' ' + op + ' ');
      }
    } else {
      setEquation(display + ' ' + op + ' ');
    }
    setShouldReset(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setShouldReset(false);
  };

  const handleEqual = () => {
    if (!equation) return;
    try {
      const fullEquation = equation + display;
      const result = eval(fullEquation);
      setDisplay(Number(result.toFixed(4)).toString());
      setEquation('');
      setShouldReset(true);
    } catch (e) {
      setDisplay('Error');
      setShouldReset(true);
    }
  };

  const handleReciprocal = () => {
    try {
      const val = parseFloat(display);
      if (val === 0) throw new Error();
      setDisplay(Number((1 / val).toFixed(6)).toString());
      setShouldReset(true);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleSqrt = () => {
    try {
      const val = parseFloat(display);
      if (val < 0) throw new Error();
      setDisplay(Number(Math.sqrt(val).toFixed(4)).toString());
      setShouldReset(true);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const buttons = [
    { label: 'C', onClick: handleClear, className: 'bg-red-600 hover:bg-red-700 text-white' },
    { label: '1/x', onClick: handleReciprocal, className: 'bg-blue-800 hover:bg-blue-700 text-blue-200' },
    { label: '√', onClick: handleSqrt, className: 'bg-blue-800 hover:bg-blue-700 text-blue-200' },
    { label: '÷', onClick: () => handleOperator('/'), className: 'bg-blue-800 hover:bg-blue-700 text-blue-200' },
    
    { label: '7', onClick: () => handleDigit('7'), className: 'bg-blue-900 hover:bg-blue-800 text-white' },
    { label: '8', onClick: () => handleDigit('8'), className: 'bg-blue-900 hover:bg-blue-800 text-white' },
    { label: '9', onClick: () => handleDigit('9'), className: 'bg-blue-900 hover:bg-blue-800 text-white' },
    { label: '×', onClick: () => handleOperator('*'), className: 'bg-blue-800 hover:bg-blue-700 text-blue-200' },
    
    { label: '4', onClick: () => handleDigit('4'), className: 'bg-blue-900 hover:bg-blue-800 text-white' },
    { label: '5', onClick: () => handleDigit('5'), className: 'bg-blue-900 hover:bg-blue-800 text-white' },
    { label: '6', onClick: () => handleDigit('6'), className: 'bg-blue-900 hover:bg-blue-800 text-white' },
    { label: '-', onClick: () => handleOperator('-'), className: 'bg-blue-800 hover:bg-blue-700 text-blue-200' },
    
    { label: '1', onClick: () => handleDigit('1'), className: 'bg-blue-900 hover:bg-blue-800 text-white' },
    { label: '2', onClick: () => handleDigit('2'), className: 'bg-blue-900 hover:bg-blue-800 text-white' },
    { label: '3', onClick: () => handleDigit('3'), className: 'bg-blue-900 hover:bg-blue-800 text-white' },
    { label: '+', onClick: () => handleOperator('+'), className: 'bg-blue-800 hover:bg-blue-700 text-blue-200' },
    
    { label: '0', onClick: () => handleDigit('0'), className: 'bg-blue-900 hover:bg-blue-800 text-white' },
    { label: '.', onClick: () => handleDigit('.'), className: 'bg-blue-900 hover:bg-blue-800 text-white' },
    { label: 'DEL', onClick: () => setDisplay(display.length > 1 ? display.slice(0, -1) : '0'), className: 'bg-slate-700 hover:bg-slate-600 text-slate-300' },
    { label: '=', onClick: handleEqual, className: 'bg-red-600 hover:bg-red-700 text-white font-black' },
  ];

  return (
    <div className="bg-slate-900 border-2 border-blue-800 rounded-2xl shadow-2xl p-5 w-80 animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
          <i className="fa-solid fa-calculator text-red-500"></i>
          Mathematics Tool
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>
      
      <div className="bg-black/40 rounded-xl p-5 mb-5 text-right overflow-hidden border border-blue-900/50 shadow-inner">
        <div className="text-[12px] text-blue-500 font-mono h-5 truncate uppercase tracking-tighter">
          {equation.replace(/\*/g, '×').replace(/\//g, '÷')}
        </div>
        <div className="text-4xl font-mono text-white truncate">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.onClick}
            className={`p-4 rounded-xl font-bold transition-all active:scale-90 text-sm shadow-md ${btn.className}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-blue-900/50 flex justify-between items-center px-1">
        <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1">
          <i className="fa-solid fa-vial-circle-check text-red-500"></i>
          Physics Ready
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          V = I × R
        </div>
      </div>
    </div>
  );
};

export default Calculator;
