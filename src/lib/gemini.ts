import { AIAnalysis } from "../types";
 
export async function analyzeLeatherProduct(imageBase64: string): Promise<AIAnalysis> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to analyze product with AI");
  }

  return response.json();
}

export async function suggestSustainabilityImpact(itemTitle: string): Promise<string> {
  const response = await fetch('/api/impact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: itemTitle })
  });

  if (!response.ok) {
    return "Positive environmental impact through circularity.";
  }

  const data = await response.json();
  return data.impact;
}
