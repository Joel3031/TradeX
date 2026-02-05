import React, { useState, useEffect } from 'react';
import { Share2, Bookmark, RefreshCw, ExternalLink } from 'lucide-react';

export function MarketNews() {
    const [newsItems, setNewsItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(false);

    const fetchNews = async () => {
        try {
            setError(false);
            const response = await fetch(
                'https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en'
            );
            const data = await response.json();

            if (data.status === 'ok') {
                const formattedNews = data.items.slice(0, 10).map((item: any, index: number) => {
                    const titleParts = item.title.split(' - ');
                    const source = titleParts.length > 1 ? titleParts.pop() : 'Google News';
                    const title = titleParts.join(' - ');

                    const pubDate = new Date(item.pubDate);
                    const now = new Date();
                    const diffInHours = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60));
                    const timeString = diffInHours > 0 ? `${diffInHours}h ago` : 'Just now';

                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = item.description;
                    const cleanSummary = tempDiv.textContent || tempDiv.innerText || "";

                    return {
                        id: index,
                        source: source,
                        time: timeString,
                        title: title,
                        summary: cleanSummary.substring(0, 120) + "...",
                        link: item.link,
                        category: "Business"
                    };
                });
                setNewsItems(formattedNews);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error("Failed to fetch news", err);
            setError(true);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchNews();
    };

    return (
        // Container: -mx-4 pulls it edge-to-edge. 'relative' establishes stacking context.
        <div className="w-auto -mx-4 bg-black text-white relative min-h-[300px]">

            {/* STICKY HEADER FIXES */}
            {/* 1. top-14 (3.5rem): Offsets the header so it sticks BELOW your main TradeX nav bar.
                   (Adjust this value if your nav bar is taller/shorter).
                2. z-40: High z-index to ensure it sits above scrolling content.
            */}
            <div className="sticky top-14 z-40 bg-black border-b border-gray-800 px-4 py-3 flex items-center justify-between shadow-md">
                <h2 className="font-bold text-lg text-white">Latest News</h2>
                <button
                    onClick={handleRefresh}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                    aria-label="Refresh news"
                >
                    <RefreshCw
                        size={20}
                        className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                </button>
            </div>

            {/* News List Content */}
            <div className="flex flex-col relative z-0">
                {loading && (
                    <div className="p-8 text-center text-gray-500">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-800 rounded w-3/4 mx-auto"></div>
                            <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto"></div>
                        </div>
                        <p className="mt-4 text-xs">Loading market updates...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="p-8 text-center">
                        <p className="text-red-400 text-sm mb-2">Unable to load news feed.</p>
                        <button onClick={handleRefresh} className="text-xs text-blue-400 hover:underline">
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && newsItems.map((item) => (
                    <article key={item.id} className="border-b border-gray-800 last:border-0 p-4 hover:bg-white/5 transition-colors group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide max-w-[150px] truncate">
                                    {item.source}
                                </span>
                                <span className="text-gray-600 text-xs">•</span>
                                <span className="text-xs text-gray-500">{item.time}</span>
                            </div>
                        </div>

                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
                            <h3 className="text-lg font-bold text-white leading-snug mb-2 group-hover:text-blue-400 transition-colors">
                                {item.title}
                            </h3>
                        </a>

                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            {item.summary}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex space-x-5">
                                <button className="flex items-center text-gray-500 hover:text-white transition-colors">
                                    <Share2 size={18} />
                                </button>
                                <button className="flex items-center text-gray-500 hover:text-white transition-colors">
                                    <Bookmark size={18} />
                                </button>
                            </div>
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-300"
                            >
                                Read Full Story <ExternalLink size={14} className="ml-1" />
                            </a>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}