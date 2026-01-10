import { GoogleGenAI } from "@google/genai";
import { VideoIdea, NicheType, SearchState, ContentAnalysis, ScriptImprovement } from "../types";
import { AI_CONFIG, generateSearchPrompt, generateScriptPrompt, generateAnalyzerPrompt, generateEnhancerPrompt } from "../config/aiPrompts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to clean JSON string
const cleanJsonString = (jsonString: string): string => {
  if (jsonString.includes("```json")) {
    return jsonString.split("```json")[1].split("```")[0];
  } else if (jsonString.includes("```")) {
    return jsonString.split("```")[1].split("```")[0];
  }
  return jsonString;
};

export const generateVideoIdeas = async (
  niche: NicheType | string,
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
    jsonString = cleanJsonString(jsonString);

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
      analytics: data.analytics ? {
        googleKeywords: data.analytics.google_keywords || [],
        youtubeKeywords: data.analytics.youtube_keywords || [],
        risingTrends: data.analytics.rising_trends || []
      } : null,
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

export const analyzeContent = async (title: string, imageBase64?: string): Promise<ContentAnalysis> => {
  const prompt = generateAnalyzerPrompt(title, !!imageBase64);
  
  const contents: any[] = [{ text: prompt }];
  
  if (imageBase64) {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    
    contents.push({
      inlineData: {
        mimeType: "image/png", // Assuming PNG or JPEG, Gemini handles most
        data: base64Data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: AI_CONFIG.model,
      contents: contents,
    });

    const jsonString = cleanJsonString(response.text || "{}");
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error analyzing content:", error);
    throw new Error("Analysis failed. Please try again.");
  }
};

export const enhanceScript = async (script: string): Promise<ScriptImprovement> => {
  const prompt = generateEnhancerPrompt(script);

  try {
    const response = await ai.models.generateContent({
      model: AI_CONFIG.model,
      contents: prompt,
    });

    const jsonString = cleanJsonString(response.text || "{}");
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error enhancing script:", error);
    throw new Error("Enhancement failed. Please try again.");
  }
};
