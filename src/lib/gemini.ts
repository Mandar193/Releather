import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeLeatherProduct(imageBase64: string): Promise<AIAnalysis> {
  const prompt = `You are a leather industry expert. Analyze this photo of a leather product.
  Identify:
  1. Condition: New, Excellent, Good, Fair, or Poor.
  2. Suggested Price: A realistic resale value in USD.
  3. Notes: A brief expert note on material quality, brand authenticity markers (if visible), and condition details.
  
  Be precise and objective. If multiple images are provided in the future, synthesize the data.
  Current analysis is based on this single image.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          condition: { type: Type.STRING, enum: ["New", "Excellent", "Good", "Fair", "Poor"] },
          suggestedPrice: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER, description: "Score from 0 to 1" },
          notes: { type: Type.STRING }
        },
        required: ["condition", "suggestedPrice", "confidence", "notes"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to get response from Gemini");
  }

  return JSON.parse(response.text) as AIAnalysis;
}

export async function suggestSustainabilityImpact(itemTitle: string): Promise<string> {
  const prompt = `Calculate and explain the environmental impact of reselling/recycling a ${itemTitle} instead of it going to a landfill.
  Mention approximate liters of water saved and CO2 emissions avoided. Keep it under 2 sentences.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  return response.text.trim();
}
