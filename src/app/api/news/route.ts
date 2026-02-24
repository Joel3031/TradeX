import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // We use process.env to keep the key secure on the server.
        // Make sure to add GNEWS_API_KEY to your Vercel/hosting environment variables!
        const API_KEY = process.env.GNEWS_API_KEY;

        // Fetch Indian business news
        const response = await fetch(
            `https://gnews.io/api/v4/top-headlines?category=business&lang=en&country=in&max=12&apikey=${API_KEY}`,
            { next: { revalidate: 3600 } } // Caches the response for 1 hour so you don't burn through API limits
        );

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Send the data back to your frontend
        return NextResponse.json(data);

    } catch (error) {
        console.error("News API Error:", error);
        return NextResponse.json(
            { error: 'Failed to fetch news' },
            { status: 500 }
        );
    }
}