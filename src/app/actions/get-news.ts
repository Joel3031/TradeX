"use server"

import Parser from "rss-parser"

export async function getMarketNews() {
    try {
        const parser = new Parser()
        // Fetching Indian Stock Market news (last 24h)
        const feed = await parser.parseURL(
            "https://news.google.com/rss/search?q=Indian+Stock+Market+when:24h&hl=en-IN&gl=IN&ceid=IN:en"
        )

        // Return top 15 items with cleaned up dates
        return feed.items.slice(0, 15).map((item) => ({
            title: item.title || "No Title",
            link: item.link || "#",
            pubDate: item.pubDate || "",
            source: item.source || "Google News",
        }))
    } catch (error) {
        console.error("Failed to fetch news:", error)
        return []
    }
}