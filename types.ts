
export interface PatientData {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  restingHR: number;
  systolicBP: number;
  diastolicBP: number;
}

export interface ECGData {
  stDepression: number;
  stSlope: 'Upsloping' | 'Flat' | 'Downsloping';
  tWaveInversion: boolean;
  qrsDuration: number;
  prInterval: number;
}

export interface TMTData {
  metsAchieved: number;
  maxExerciseHR: number;
  exerciseDuration: number;
  anginaDuringExercise: boolean;
  targetHRAttained: boolean;
}

export interface AnalysisResult {
  riskScore: number; // 0 to 100
  potentialConditions: string[];
  explanation: string;
  featureImportance: { feature: string; impact: number }[];
  recommendations: {
    diet: string[];
    herbs: string[];
    lifestyle: string[];
  };
}

export interface FullReport extends AnalysisResult {
  id: string;
  date: string;
  patient: PatientData;
  ecg: ECGData;
  tmt: TMTData;
}
