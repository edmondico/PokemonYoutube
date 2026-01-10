import { GoogleGenAI } from "@google/genai";
import { VideoIdea, NicheType, SearchState } from "../types";
import { AI_CONFIG, generateSearchPrompt, generateScriptPrompt } from "../config/aiPrompts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateVideoIdeas = async (
  niche: NicheType,
  dislikedContext: string[] = [],
  customInstructions: string = ""
): Promise<SearchState> => {

  const prompt = generateSearchPrompt(niche, dislikedContext, customInstructions);

  try {
    const response = await ai.models.generateContent({
      model: AI_CONFIG.model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title || new URL(chunk.web.uri).hostname
      }));

    let jsonString = response.text || "{}";

    if (jsonString.includes("```json")) {
      jsonString = jsonString.split("```json")[1].split("```")[0];
    } else if (jsonString.includes("```")) {
      jsonString = jsonString.split("```")[1].split("```")[0];
    }

    const data = JSON.parse(jsonString);

    // Helper to process lists
    const processList = (list: any[]) => (list || []).map((i: any) => ({ ...i, id: generateId(), createdAt: Date.now() }));

    return {
      loading: false,
      error: null,
      outliers: processList(data.outliers),
      videoIdeas: processList(data.video_ideas),
      trending: processList(data.trending),
      mostSearched: processList(data.most_searched),
      groundingSources: sources
    };

  } catch (error) {
    console.error("Error generating ideas:", error);
    throw new Error("Could not generate ideas. Please try again.");
  }
};

export const generateScript = async (idea: VideoIdea): Promise<string> => {
  const prompt = generateScriptPrompt(idea.title, idea.description, idea.category);

  const response = await ai.models.generateContent({
    model: AI_CONFIG.model,
    contents: prompt,
  });

  return response.text || "Failed to generate script.";
};
