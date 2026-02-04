
export enum CircuitType {
  SERIES = 'SERIES',
  PARALLEL = 'PARALLEL',
  COMBINATION = 'COMBINATION'
}

export interface Resistor {
  id: string;
  resistance: number; // in Ohms
  label: string;
}

export interface CircuitData {
  type: CircuitType;
  voltage: number; // in Volts
  resistors: Resistor[];
}

export interface CalculationResult {
  totalResistance: number;
  totalCurrent: number;
  voltages: Record<string, number>;
  currents: Record<string, number>;
}
