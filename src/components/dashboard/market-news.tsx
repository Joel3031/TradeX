import React, { useState, useEffect } from 'react';
import { RefreshCw, Newspaper, ExternalLink } from 'lucide-react';

export function MarketNews() {
    const [newsItems, setNewsItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(false);

    // const fetchNews = async () => {
    //     try {
    //         setError(false);
    //         const response = await fetch(
    //             'https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en'
    //         );
    //         const data = await response.json();

    //         if (data.status === 'ok') {
    //             const formattedNews = data.items.slice(0, 12).map((item: any, index: number) => {
    //                 const titleParts = item.title.split(' - ');
    //                 const source = titleParts.length > 1 ? titleParts.pop() : 'Market News';
    //                 const title = titleParts.join(' - ');

    //                 const pubDate = new Date(item.pubDate);
    //                 const now = new Date();
    //                 const diffInHours = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60));
    //                 const timeString = diffInHours > 0 ? `${diffInHours}h ago` : 'Just now';

    //                 let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link);
    //                 if (!imageUrl) {
    //                     const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
    //                     if (imgMatch) {
    //                         imageUrl = imgMatch[1];
    //                     }
    //                 }

    //                 return {
    //                     id: index,
    //                     source: source,
    //                     time: timeString,
    //                     title: title,
    //                     link: item.link,
    //                     imageUrl: imageUrl
    //                 };
    //             });
    //             setNewsItems(formattedNews);
    //         } else {
    //             setError(true);
    //         }
    //     } catch (err) {
    //         console.error("Failed to fetch news", err);
    //         setError(true);
    //     } finally {
    //         setLoading(false);
    //         setIsRefreshing(false);
    //     }
    // };

    const fetchNews = async () => {
        try {
            setError(false);

            // country=in gets Indian news. Change to 'us' or 'gb' for other regions, 
            // or remove the country parameter entirely for global business news.
            const response = await fetch('/api/news');

            const data = await response.json();

            if (response.ok && data.articles) {
                const formattedNews = data.articles.map((item: any, index: number) => {

                    // Format time
                    const pubDate = new Date(item.publishedAt);
                    const now = new Date();
                    const diffInHours = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60));
                    const timeString = diffInHours > 0 ? `${diffInHours}h ago` : 'Just now';

                    return {
                        id: index,
                        source: item.source.name, // Clean source name directly from API
                        time: timeString,
                        title: item.title,
                        link: item.url,
                        imageUrl: item.image // High-quality image URL guaranteed by API
                    };
                });
                setNewsItems(formattedNews);
            } else {
                console.error("API Error:", data.errors);
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
        <div className="w-full space-y-6">
            {/* Minimalist Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-semibold text-lg text-foreground tracking-tight">Market Updates</h2>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                    {isRefreshing ? 'Updating...' : 'Refresh'}
                    <RefreshCw size={14} className={`${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex gap-4 p-3 animate-pulse">
                            <div className="h-20 w-20 rounded-xl bg-muted/50 shrink-0"></div>
                            <div className="flex-1 space-y-3 py-1">
                                <div className="h-3 bg-muted/50 rounded w-1/3"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-muted/50 rounded w-full"></div>
                                    <div className="h-4 bg-muted/50 rounded w-4/5"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="py-12 text-center rounded-2xl border border-dashed border-border bg-muted/10">
                    <p className="text-muted-foreground text-sm mb-3">Unable to load latest market news.</p>
                    <button onClick={handleRefresh} className="text-sm font-medium text-green-600 hover:text-green-500">
                        Try Again
                    </button>
                </div>
            )}

            {/* Mini Cards Grid */}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {newsItems.map((item) => (
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={item.id}
                            className="group block"
                        >
                            <div className="flex gap-4 p-3 rounded-2xl border border-transparent hover:border-border hover:bg-card hover:shadow-sm transition-all duration-300">

                                {/* Image Container */}
                                {item.imageUrl ? (
                                    <div className="shrink-0 relative overflow-hidden rounded-xl h-20 w-20 sm:h-24 sm:w-24 border border-border/50 bg-muted">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.source}
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="shrink-0 flex items-center justify-center rounded-xl h-20 w-20 sm:h-24 sm:w-24 bg-muted/50 border border-border/30 group-hover:bg-muted transition-colors">
                                        <Newspaper className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                )}

                                {/* Content Container */}
                                <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
                                    <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                                        <span className="text-green-600 dark:text-green-500 truncate max-w-[120px]">
                                            {item.source}
                                        </span>
                                        <span className="opacity-50">•</span>
                                        <span className="shrink-0">{item.time}</span>
                                    </div>
                                    <h3 className="font-semibold text-sm sm:text-base text-foreground leading-snug line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors">
                                        {item.title}
                                    </h3>
                                </div>

                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}