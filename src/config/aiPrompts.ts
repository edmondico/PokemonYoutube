/**
 * AI Prompts Configuration
 *
 * Edit these prompts to customize how the AI generates video ideas.
 * Changes here will affect all searches.
 */

export const AI_CONFIG = {
  // The AI model to use
  model: 'gemini-2.5-flash',

  // Main system context - who the AI should act as
  systemRole: `Act as a YouTube Strategist expert in the {niche} niche (US/Global Market).`,

  // Categories for generated ideas
  categories: {
    outliers: {
      name: 'Market Outliers',
      count: 8,
      description: 'High variance, specific anomalies. (e.g., "Why is THIS specific card up 300%?", "The PSA 10 population gap"). High risk, high reward.',
    },
    videoIdeas: {
      name: 'General Video Ideas',
      count: 8,
      description: 'Solid, broad appeal content. (e.g., "Top 10 Sets", "Buying Guide 2024"). Consistent views.',
    },
    trending: {
      name: 'Trending Now',
      count: 8,
      description: 'News, Drama, New Releases. What is viral *today*? (e.g., "New set leaks", "YouTuber controversy").',
    },
    mostSearched: {
      name: 'Most Searched',
      count: 8,
      description: 'High SEO volume queries. Problem solving. (e.g., "How to grade cards", "Is Pokemon TCG dying?").',
    },
  },

  // Valid categories for ideas
  ideaCategories: ['Investing', 'Collecting', 'Gameplay', 'News'] as const,

  // Competition levels
  competitionLevels: ['Low', 'Medium', 'High'] as const,
};

/**
 * Generate the main search prompt
 */
export const generateSearchPrompt = (
  niche: string,
  dislikedContext: string[],
  customInstructions: string
): string => {
  const negativeConstraint = dislikedContext.length > 0
    ? `IMPORTANT: The user has explicitly DISLIKED the following topics/angles. DO NOT suggest anything similar to these: ${JSON.stringify(dislikedContext)}.`
    : "";

  const customContext = customInstructions.trim()
    ? `ADDITIONAL USER INSTRUCTIONS (PRIORITIZE THIS): ${customInstructions}`
    : "";

  return `
    ${AI_CONFIG.systemRole.replace('{niche}', niche)}

    ${negativeConstraint}
    ${customContext}

    Your goal is to generate FOUR distinct lists of content ideas based on REAL-TIME Google Search & YouTube trends.

    1. **${AI_CONFIG.categories.outliers.name.toUpperCase()} (${AI_CONFIG.categories.outliers.count} items)**: ${AI_CONFIG.categories.outliers.description}
    2. **${AI_CONFIG.categories.videoIdeas.name.toUpperCase()} (${AI_CONFIG.categories.videoIdeas.count} items)**: ${AI_CONFIG.categories.videoIdeas.description}
    3. **${AI_CONFIG.categories.trending.name.toUpperCase()} (${AI_CONFIG.categories.trending.count} items)**: ${AI_CONFIG.categories.trending.description}
    4. **${AI_CONFIG.categories.mostSearched.name.toUpperCase()} (${AI_CONFIG.categories.mostSearched.count} items)**: ${AI_CONFIG.categories.mostSearched.description}

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
      ],
      "analytics": {
        "google_keywords": [ { "keyword": "...", "volume": 85 } ],
        "youtube_keywords": [ { "keyword": "...", "volume": 75 } ],
        "rising_trends": [ { "keyword": "...", "volume": 95 } ]
      }
    }
    \`\`\`
  `;
};

/**
 * Generate the script writing prompt
 */
export const generateScriptPrompt = (
  title: string,
  description: string,
  category: string
): string => {
  return `
    Create a detailed YouTube Video Outline & Script for a video titled: "${title}".
    Context: ${description}
    Niche: Pokemon TCG (${category})
    Target Audience: US Collectors/Investors.

    Structure:
    1. **Hook (0:00-0:45)**: Exact words to say to grab attention immediately.
    2. **Intro**: Brief channel intro.
    3. **Key Points (Bullet points)**: 3-5 main detailed talking points with data/reasoning.
    4. **Affiliate/Call to Action**: Where to insert it.
    5. **Conclusion**: Final thought.

    Format: Markdown.
  `;
};

/**
 * Niches available for searching
 */
export const NICHES = {
  ALL: 'Entire Pokemon Market (Investing, Collecting, Gameplay)',
  INVESTING: 'Pokemon Investing',
  COLLECTING: 'Pokemon Collecting',
  TCG_PLAY: 'Pokemon TCG Meta/Gameplay',
  VINTAGE: 'Vintage Pokemon Cards',
} as const;

export type NicheKey = keyof typeof NICHES;
