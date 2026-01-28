
import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, ECGData, TMTData, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeCardiacData = async (
  patient: PatientData,
  ecg: ECGData,
  tmt: TMTData
): Promise<AnalysisResult> => {
  const prompt = `
    Perform a clinical-grade heart disease risk analysis based on the following patient data:
    
    Patient: ${patient.age}yo ${patient.gender}, Resting HR: ${patient.restingHR}bpm, BP: ${patient.systolicBP}/${patient.diastolicBP}mmHg.
    ECG Findings: ST Depression: ${ecg.stDepression}mm, ST Slope: ${ecg.stSlope}, T-Wave Inversion: ${ecg.tWaveInversion}, QRS: ${ecg.qrsDuration}ms.
    TMT Results: METs: ${tmt.metsAchieved}, Max HR: ${tmt.maxExerciseHR}bpm, Angina: ${tmt.anginaDuringExercise}.

    Using Explainable AI (XAI) principles, calculate:
    1. Risk Score (0-100)
    2. Potential conditions (e.g. CAD, Ischemia, LVH, etc.)
    3. Detailed medical explanation for the prediction.
    4. Feature Importance (which data points contributed most to the risk).
    5. Home remedies & lifestyle recommendations (Diet, Herbs, Lifestyle).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskScore: { type: Type.NUMBER },
          potentialConditions: { type: Type.ARRAY, items: { type: Type.STRING } },
          explanation: { type: Type.STRING },
          featureImportance: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                feature: { type: Type.STRING },
                impact: { type: Type.NUMBER }
              },
              required: ["feature", "impact"]
            }
          },
          recommendations: {
            type: Type.OBJECT,
            properties: {
              diet: { type: Type.ARRAY, items: { type: Type.STRING } },
              herbs: { type: Type.ARRAY, items: { type: Type.STRING } },
              lifestyle: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["diet", "herbs", "lifestyle"]
          }
        },
        required: ["riskScore", "potentialConditions", "explanation", "featureImportance", "recommendations"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    throw new Error("Failed to parse AI analysis");
  }
};
