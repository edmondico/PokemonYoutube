import { GoogleGenAI } from "@google/genai";
import { VideoIdea, NicheType, SearchState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateVideoIdeas = async (
  niche: NicheType,
  dislikedContext: string[] = [], // List of titles/topics the user hated
  customInstructions: string = "" // Optional custom user instructions
): Promise<SearchState> => {
  
  const negativeConstraint = dislikedContext.length > 0 
    ? `IMPORTANT: The user has explicitly DISLIKED the following topics/angles. DO NOT suggest anything similar to these: ${JSON.stringify(dislikedContext)}.` 
    : "";

  const customContext = customInstructions.trim() 
    ? `ADDITIONAL USER INSTRUCTIONS (PRIORITIZE THIS): ${customInstructions}` 
    : "";

  const prompt = `
    Act as a YouTube Strategist expert in the ${niche} niche (US/Global Market).
    
    ${negativeConstraint}
    ${customContext}

    Your goal is to generate FOUR distinct lists of content ideas based on REAL-TIME Google Search & YouTube trends.
    
    1. **MARKET OUTLIERS (8 items)**: High variance, specific anomalies. (e.g., "Why is THIS specific card up 300%?", "The PSA 10 population gap"). High risk, high reward.
    2. **GENERAL VIDEO IDEAS (8 items)**: Solid, broad appeal content. (e.g., "Top 10 Sets", "Buying Guide 2024"). Consistent views.
    3. **TRENDING NOW (8 items)**: News, Drama, New Releases. What is viral *today*? (e.g., "New set leaks", "YouTuber controversy").
    4. **MOST SEARCHED (8 items)**: High SEO volume queries. Problem solving. (e.g., "How to grade cards", "Is Pokemon TCG dying?").

    Return the response STRICTLY in the following JSON format:
    \`\`\`json
    {
      "outliers": [
        { "title": "...", "description": "...", "category": "Investing", "viralScore": 90, "competition": "Low", "reasoning": "...", "tags": ["..."] }
      ],
      "video_ideas": [
        { "title": "...", "description": "...", "category": "Collecting", "viralScore": 80, "competition": "Medium", "reasoning": "...", "tags": ["..."] }
      ],
      "trending": [
        { "title": "...", "description": "...", "category": "News", "viralScore": 95, "competition": "High", "reasoning": "...", "tags": ["..."] }
      ],
      "most_searched": [
        { "title": "...", "description": "...", "category": "Investing", "viralScore": 85, "competition": "High", "reasoning": "...", "tags": ["..."] }
      ]
    }
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
    const prompt = `
        Create a detailed YouTube Video Outline & Script for a video titled: "${idea.title}".
        Context: ${idea.description}
        Niche: Pokemon TCG (${idea.category})
        Target Audience: US Collectors/Investors.

        Structure:
        1. **Hook (0:00-0:45)**: Exact words to say to grab attention immediately.
        2. **Intro**: Brief channel intro.
        3. **Key Points (Bullet points)**: 3-5 main detailed talking points with data/reasoning.
        4. **Affiliate/Call to Action**: Where to insert it.
        5. **Conclusion**: Final thought.

        Format: Markdown.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text || "Failed to generate script.";
}