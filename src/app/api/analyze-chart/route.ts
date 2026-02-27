import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize the Groq SDK
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: Request) {
    try {
        const { image, ticker, prompt: userPrompt } = await req.json();

        // 1. Dynamically determine the sector using Groq's fast text model
        let sector = "";
        if (ticker && ticker.toUpperCase() !== "MARKET") {
            try {
                const sectorPrompt = `Identify the primary industry sector for the stock ticker "${ticker}". Reply with ONLY the sector name in 1-2 words (e.g., Banking, IT, Metal, Auto, Pharma). Do not include any other text or punctuation.`;
                const sectorResult = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: sectorPrompt }],
                    temperature: 0.1,
                });

                sector = sectorResult.choices[0]?.message?.content?.trim().replace(/[^a-zA-Z\s]/g, '') || "";
            } catch (e) {
                console.error("Sector identification failed:", e);
            }
        }

        // 2. Fetch Latest News for BOTH the Ticker & the Sector
        let newsContext = "No specific recent news found.";
        if (ticker && ticker.toUpperCase() !== "MARKET") {
            const gnewsKey = process.env.GNEWS_API_KEY;

            const queryStr = sector
                ? `(${ticker} OR "${sector} sector") AND (stock OR share OR market)`
                : `${ticker} AND (stock OR share OR market)`;

            const searchQuery = encodeURIComponent(queryStr);
            const newsRes = await fetch(`https://gnews.io/api/v4/search?q=${searchQuery}&lang=en&country=in&max=5&apikey=${gnewsKey}`);

            if (newsRes.ok) {
                const newsData = await newsRes.json();
                if (newsData.articles && newsData.articles.length > 0) {
                    newsContext = newsData.articles.map((a: any) => `- ${a.title}`).join('\n');
                }
            }
        }

        // 3. Construct the Expert Prompt
        const finalPrompt = `
        You are an expert technical analyst and trading coach.
        The user is asking about the stock/asset: ${ticker || 'General Market'} ${sector ? `(Sector: ${sector})` : ''}.
        User Query: ${userPrompt || 'Analyze this chart and predict the probable trajectory.'}

        Here are the latest news headlines related to this asset and its sector for context:
        ${newsContext}

        Task: 
        1. If an image is provided, analyze the technical setup (support/resistance, price action patterns, momentum).
        2. Evaluate the provided news headlines to gauge current fundamental sentiment for both the specific stock and its broader sector.
        3. Synthesize both the technicals and the news to predict the probable trajectory for the upcoming session.

        You must format your response EXACTLY using these three headings with short, actionable bullet points:
        
        **📈 Technical Analysis:**
        (Your chart analysis here. If no image was provided, simply state that you need a chart for technical analysis).

        **📰 News Sentiment:**
        (State if the news is Bullish, Bearish, or Neutral, and briefly summarize why based on the provided company and sector headlines).

        **🎯 Probable Trajectory:**
        (Provide a clear, concise prediction for the next session based on the confluence of the technicals and the news).
        `;

        // 4. Prepare messages array for Groq
        const content: any[] = [
            { type: "text", text: finalPrompt }
        ];

        // If an image exists, append it as a URL object (Groq accepts the base64 data URI directly)
        if (image) {
            content.push({
                type: "image_url",
                image_url: {
                    url: image
                }
            });
        }

        // 5. Smart Model Routing
        // Use the multimodal Llama 4 Scout if an image is attached, otherwise use the massive 70B text model
        const selectedModel = image ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.3-70b-versatile";

        // 6. Generate Response
        const result = await groq.chat.completions.create({
            model: selectedModel,
            messages: [{ role: "user", content }],
        });

        const responseText = result.choices[0]?.message?.content || "No response generated.";

        return NextResponse.json({ result: responseText });

    } catch (error) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json({ error: "Failed to analyze chart" }, { status: 500 });
    }
}   