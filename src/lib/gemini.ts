import { AIAnalysis } from "../types";

export async function analyzeLeatherProduct(imageBase64: string): Promise<AIAnalysis> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error("AI Analysis Error (via Proxy):", err);
    throw new Error(err.message || "Failed to analyze product with AI");
  }
}

export async function suggestSustainabilityImpact(itemTitle: string): Promise<string> {
  try {
    const response = await fetch('/api/impact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: itemTitle })
    });

    if (!response.ok) return "Positive environmental impact through circularity.";

    const data = await response.json();
    return data.impact || "Positive environmental impact through circularity.";
  } catch (err: any) {
    console.warn("Impact suggestion failed:", err);
    return "Positive environmental impact through circularity.";
  }
}
