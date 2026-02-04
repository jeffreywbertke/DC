
import React, { useState, useEffect, useCallback } from 'react';
import { CircuitType, CircuitData, CalculationResult, Resistor } from './types';
import CircuitRenderer from './components/CircuitRenderer';
import Calculator from './components/Calculator';
import { getCircuitExplanation } from './services/geminiService';

const App: React.FC = () => {
  const [selectedType, setSelectedType] = useState<CircuitType>(CircuitType.SERIES);
  const [circuit, setCircuit] = useState<CircuitData | null>(null);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [questionTarget, setQuestionTarget] = useState<'volts' | 'ohms' | 'amps'>('ohms');
  const [showCalculator, setShowCalculator] = useState<boolean>(false);

  // Generates a new random physics problem based on selected circuit type
  const generateProblem = useCallback(() => {
    const v = Math.floor(Math.random() * 20) + 5; // 5 to 25V
    const rValues = [
      Math.floor(Math.random() * 50) + 10,
      Math.floor(Math.random() * 50) + 10,
      Math.floor(Math.random() * 50) + 10,
    ];

    const resistors: Resistor[] = rValues.map((val, idx) => ({
      id: `r${idx + 1}`,
      label: `R${idx + 1}`,
      resistance: val,
    }));

    const newCircuit: CircuitData = {
      type: selectedType,
      voltage: v,
      resistors: selectedType === CircuitType.PARALLEL ? resistors.slice(0, 2) : resistors,
    };

    // Calculate actuals for verification
    let rTotal = 0;
    if (selectedType === CircuitType.SERIES) {
      rTotal = newCircuit.resistors.reduce((acc, r) => acc + r.resistance, 0);
    } else if (selectedType === CircuitType.PARALLEL) {
      const invR = newCircuit.resistors.reduce((acc, r) => acc + (1 / r.resistance), 0);
      rTotal = 1 / invR;
    } else {
      // Combination: R1 in series with (R2 // R3)
      const rPara = 1 / ((1 / resistors[1].resistance) + (1 / resistors[2].resistance));
      rTotal = resistors[0].resistance + rPara;
    }

    const iTotal = v / rTotal;

    const calcResults: CalculationResult = {
      totalResistance: rTotal,
      totalCurrent: iTotal,
      voltages: {},
      currents: {},
    };

    setCircuit(newCircuit);
    setResults(calcResults);
    setUserAnswer('');
    setFeedback(null);
    setAiExplanation('');
    
    // Pick a random target for the question
    const targets: ('volts' | 'ohms' | 'amps')[] = ['ohms', 'amps'];
    setQuestionTarget(targets[Math.floor(Math.random() * targets.length)]);
  }, [selectedType]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const handleCheckAnswer = () => {
    if (!results) return;
    const numericAnswer = parseFloat(userAnswer);
    let targetVal = 0;

    if (questionTarget === 'ohms') targetVal = results.totalResistance;
    else if (questionTarget === 'amps') targetVal = results.totalCurrent;

    if (Math.abs(numericAnswer - targetVal) < 0.5) {
      setFeedback({ isCorrect: true, message: "Excellent! You've mastered Ohm's Law for this circuit." });
    } else {
      setFeedback({ isCorrect: false, message: `Not quite. The correct answer was approximately ${targetVal.toFixed(2)}.` });
    }
  };

  const handleGetAiHelp = async () => {
    if (!circuit || !results) return;
    setIsLoadingAi(true);
    setAiExplanation(''); // Clear previous explanation
    const explanation = await getCircuitExplanation(circuit, results, questionTarget);
    setAiExplanation(explanation);
    setIsLoadingAi(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-red-500 selection:text-white bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 p-6 shadow-xl border-b-4 border-red-600 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-bolt-lightning text-red-500 text-3xl animate-pulse"></i>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">DC Circuit Master</h1>
          </div>
          <nav className="flex bg-blue-900/50 rounded-full p-1 border border-blue-700 shadow-inner">
            {Object.values(CircuitType).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-6 py-2 rounded-full transition-all text-sm font-bold uppercase tracking-widest ${
                  selectedType === type 
                    ? 'bg-red-600 text-white shadow-lg' 
                    : 'text-blue-200 hover:text-white hover:bg-blue-800'
                }`}
              >
                {type}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        
        {/* Left: Circuit Visualizer */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-blue-900 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black flex items-center gap-2 text-blue-400 uppercase tracking-tight">
                <i className="fa-solid fa-microchip"></i>
                Schematic
              </h2>
              <span className="bg-red-600/20 text-red-500 text-xs font-black px-3 py-1 rounded-full border border-red-600/30">
                ACTIVE
              </span>
            </div>
            {circuit && <CircuitRenderer circuit={circuit} />}
            
            <div className="mt-8 grid grid-cols-3 gap-4">
               <div className="bg-blue-950/50 p-4 rounded-xl border border-blue-900 text-center shadow-inner">
                  <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-1">Source</p>
                  <p className="text-2xl font-mono font-black text-red-500">{circuit?.voltage}V</p>
               </div>
               <div className="bg-blue-950/50 p-4 rounded-xl border border-blue-900 text-center shadow-inner">
                  <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-1">Type</p>
                  <p className="text-sm font-bold text-white uppercase">{selectedType}</p>
               </div>
               <div className="bg-blue-950/50 p-4 rounded-xl border border-blue-900 text-center shadow-inner">
                  <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-1">Loads</p>
                  <p className="text-2xl font-mono font-black text-white">{circuit?.resistors.length}</p>
               </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-blue-900/50 rounded-2xl p-6 backdrop-blur-sm">
             <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-red-500 uppercase tracking-widest">
               <i className="fa-solid fa-graduation-cap"></i>
               Learning Lab
             </h3>
             <ul className="text-sm text-blue-100/80 space-y-3 font-medium">
               <li className="flex items-start gap-2">
                 <span className="text-red-600 mt-1">•</span>
                 <span>Find <b>Total Resistance (Req)</b> first by checking if components are in Series or Parallel.</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-red-600 mt-1">•</span>
                 <span>Use <b>V = I × R</b> to find the relationship between Voltage, Current, and Resistance.</span>
               </li>
             </ul>
          </div>
        </div>

        {/* Right: Problem & Solver */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-blue-900 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <i className="fa-solid fa-atom text-8xl text-red-500"></i>
            </div>
            
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-white border-b-2 border-red-600 pb-2 inline-block">Problem Set</h2>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              Analyze the circuit. What is the 
              <span className="font-black text-red-500 bg-red-500/10 px-2 py-1 rounded mx-1">
                TOTAL {questionTarget === 'ohms' ? 'RESISTANCE (Ω)' : 'CURRENT (A)'}
              </span> 
              of the entire system?
            </p>

            <div className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your calculation..."
                  className="w-full bg-slate-950 border-2 border-blue-900 rounded-xl px-6 py-4 text-2xl font-mono text-white focus:outline-none focus:border-red-500 transition-colors placeholder:text-blue-900"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-900 font-black text-xl">
                  {questionTarget === 'ohms' ? 'Ω' : 'A'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCheckAnswer}
                  className="bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest"
                >
                  Check Answer
                </button>
                <button
                  onClick={generateProblem}
                  className="bg-blue-800 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest"
                >
                  New Problem
                </button>
              </div>
            </div>

            {feedback && (
              <div className={`mt-6 p-4 rounded-xl border-2 ${feedback.isCorrect ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'} animate-in zoom-in-95 duration-200`}>
                <p className="font-bold flex items-center gap-2">
                  <i className={`fa-solid ${feedback.isCorrect ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                  {feedback.message}
                </p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-blue-900/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-blue-400 uppercase tracking-widest text-sm flex items-center gap-2">
                  <i className="fa-solid fa-robot"></i>
                  Stuck? Ask the AI Tutor
                </h3>
                <button
                  onClick={handleGetAiHelp}
                  disabled={isLoadingAi}
                  className="bg-blue-900/50 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border border-blue-700 disabled:opacity-50 transition-all"
                >
                  {isLoadingAi ? 'Consulting...' : 'Explain Steps'}
                </button>
              </div>
              
              {aiExplanation && (
                <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-6 text-blue-100/90 text-sm leading-relaxed font-medium whitespace-pre-wrap animate-in fade-in slide-in-from-top-4 duration-500">
                  {aiExplanation}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-blue-300 py-4 rounded-2xl border border-blue-900 font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
          >
            <i className="fa-solid fa-calculator"></i>
            {showCalculator ? 'Hide Math Tool' : 'Open Math Tool'}
          </button>
        </div>

        {/* Floating Calculator */}
        {showCalculator && (
          <div className="fixed bottom-8 right-8 z-50">
            <Calculator onClose={() => setShowCalculator(false)} />
          </div>
        )}
      </main>

      <footer className="bg-slate-900 border-t border-blue-900/50 p-8 text-center mt-auto">
        <p className="text-blue-500 text-xs font-black uppercase tracking-[0.2em]">
          &copy; 2024 DC Circuit Master &bull; Powered by Gemini Flash
        </p>
      </footer>
    </div>
  );
};

export default App;
