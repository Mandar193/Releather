import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

let ai: any = null;

function getAI() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key === '') {
      throw new Error("Gemini API Key is not configured. Please add GEMINI_API_KEY to your environment variables or Secrets tab in the AI Studio editor.");
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

export async function analyzeLeatherProduct(imageBase64: string): Promise<AIAnalysis> {
  const response = await getAI().models.generateContent({ 
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
        { text: `You are a leather industry expert. Analyze this photo of a leather product.
          Identify:
          1. Condition: New, Excellent, Good, Fair, or Poor.
          2. Suggested Price: A realistic resale value in USD.
          3. Notes: A brief expert note on material quality, brand authenticity markers (if visible), and condition details.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          condition: { type: Type.STRING }, // Enum validation handled by prompt better in some versions
          suggestedPrice: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
          notes: { type: Type.STRING }
        },
        required: ["condition", "suggestedPrice", "confidence", "notes"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to get response from Gemini");
  return JSON.parse(text) as AIAnalysis;
}

export async function suggestSustainabilityImpact(itemTitle: string): Promise<string> {
  const response = await getAI().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Calculate and explain the environmental impact of reselling/recycling a ${itemTitle} instead of it going to a landfill.
      Mention approximate liters of water saved and CO2 emissions avoided. Keep it under 2 sentences.`
  });
  
  return (response.text || "").trim();
}
