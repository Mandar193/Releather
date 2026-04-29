import { AIAnalysis } from "../types";

export async function analyzeLeatherProduct(imageBase64: string): Promise<AIAnalysis> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 })
  });

  const text = await response.text();
  console.log('AI Analysis Raw Response:', text);
  
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse AI response: ${text.substring(0, 100)}...`);
  }
  
  if (!response.ok) {
    throw new Error(data.error || "Failed to analyze product with AI");
  }

  return data as AIAnalysis;
}

export async function suggestSustainabilityImpact(itemTitle: string): Promise<string> {
  const response = await fetch('/api/impact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: itemTitle })
  });

  const data = await response.json();

  if (!response.ok) {
    console.warn("Impact suggestion failed:", data.error);
    return "Positive environmental impact through circularity.";
  }

  return data.impact;
}
