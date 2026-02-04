
import { GoogleGenAI } from "@google/genai";
import { CircuitData, CalculationResult } from "../types";

// Always use process.env.API_KEY for initializing the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getCircuitExplanation(
  circuit: CircuitData,
  results: CalculationResult,
  targetValue: 'volts' | 'ohms' | 'amps'
) {
  // Use model-specific reasoning for pedagogical clarity
  const prompt = `
    The student needs help finding the TOTAL ${targetValue.toUpperCase()} for this ${circuit.type} circuit.
    
    CIRCUIT PARAMETERS:
    - Battery: ${circuit.voltage}V
    - Resistors: ${circuit.resistors.map(r => `${r.label}=${r.resistance}Ω`).join(', ')}
    - Calculated Total Resistance (Req): ${results.totalResistance.toFixed(2)}Ω
    - Calculated Total Current (Itot): ${results.totalCurrent.toFixed(2)}A
    
    Please provide the solution in exactly 4 numbered steps:
    1. GIVEN: List the known values relevant to the problem.
    2. FORMULA: State the specific physics formula used (e.g., Ohm's Law or Resistance combination).
    3. CALCULATION: Show the simple math of plugging the numbers in.
    4. RESULT: The final answer with units.
    
    Keep the language very simple, like a high school tutor. Avoid complex markdown, just use basic text and numbers.
  `;

  try {
    // Correct usage of generateContent with model name and prompt
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful, encouraging high school physics tutor. Your goal is to explain DC circuits simply. You always use clear, numbered steps and never provide over-complicated technical jargon.",
        // Disable thinking for low-latency basic Q&A tasks
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    // Access response.text directly (property, not a method)
    return response.text || "I'm sorry, I had trouble calculating that. Please try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI Tutor is currently offline. Please check your network connection or try a different problem.";
  }
}
