import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const fixJsonWithAi = async (malformedJson: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) throw new Error("AI Service Unavailable: Missing API Key");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a strict JSON repair tool. Fix the following malformed JSON. Return ONLY the valid JSON string. Do not add markdown formatting like \`\`\`json or explanations.
      
      Malformed JSON:
      ${malformedJson.slice(0, 10000)}`, // Truncate to avoid token limits if massive
    });

    let text = response.text || "{}";
    // Clean up if the model accidentally added markdown
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return text;
  } catch (error) {
    console.error("Gemini Fix JSON Error:", error);
    throw new Error("Failed to fix JSON using AI.");
  }
};

export const generateSampleJson = async (topic: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) throw new Error("AI Service Unavailable: Missing API Key");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a complex, nested JSON example regarding "${topic}". 
      Include arrays, booleans, numbers, and nulls. 
      Return ONLY the raw JSON string without markdown formatting.`,
    });
    
    let text = response.text || "{}";
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return text;
  } catch (error) {
    console.error("Gemini Generate JSON Error:", error);
    throw new Error("Failed to generate sample JSON.");
  }
};