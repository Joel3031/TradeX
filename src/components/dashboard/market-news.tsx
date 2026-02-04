import React from 'react';
import { ChevronLeft, Share2, Bookmark, MoreHorizontal } from 'lucide-react';

// Changed to named export 'MarketNews' to match your import in app-dashboard.tsx
export function MarketNews() {
    const newsItems = [
        {
            id: 1,
            source: "Financial Times",
            time: "2h ago",
            title: "Global Markets Rally as Tech Sector Rebounds Significantly",
            summary: "Major indices saw a sharp increase today as semiconductor stocks led the charge following positive earnings reports from key industry players.",
            image: "/api/placeholder/400/200",
            category: "Markets"
        },
        {
            id: 2,
            source: "Bloomberg",
            time: "4h ago",
            title: "Central Banks Signal Potential Rate Cuts in Q3",
            summary: "Analysts predict a shift in monetary policy as inflation data cools faster than anticipated in the Eurozone and US markets.",
            image: "/api/placeholder/400/200",
            category: "Economy"
        },
        {
            id: 3,
            source: "TechCrunch",
            time: "5h ago",
            title: "New AI Regulations: What Investors Need to Know",
            summary: "The upcoming legislative framework aims to balance innovation with safety, potentially impacting software valuations.",
            image: "/api/placeholder/400/200",
            category: "Technology"
        }
    ];

    return (
        <div className="bg-white w-full border border-gray-200 rounded-lg overflow-hidden">

            {/* Header - Adjusted for widget context */}
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-900">Latest News</h2>
                <button className="p-1 hover:bg-gray-50 rounded-full">
                    <MoreHorizontal size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Full Width List Content */}
            <div>
                {newsItems.map((item) => (
                    <article key={item.id} className="border-b border-gray-100 last:border-0">
                        {/* Edge-to-Edge Image */}
                        <div className="w-full aspect-[2/1] bg-gray-100 overflow-hidden relative">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-sm backdrop-blur-md">
                                {item.category}
                            </span>
                        </div>

                        {/* Content Container */}
                        <div className="p-4 bg-white">
                            {/* Meta Data */}
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                                    {item.source}
                                </span>
                                <span className="text-gray-300 text-xs">•</span>
                                <span className="text-xs text-gray-500">{item.time}</span>
                            </div>

                            {/* Headline */}
                            <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2">
                                {item.title}
                            </h3>

                            {/* Summary */}
                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                                {item.summary}
                            </p>

                            {/* Action Bar */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex space-x-4">
                                    <button className="flex items-center space-x-1 text-gray-400 hover:text-gray-600">
                                        <Share2 size={18} />
                                    </button>
                                    <button className="flex items-center space-x-1 text-gray-400 hover:text-gray-600">
                                        <Bookmark size={18} />
                                    </button>
                                </div>
                                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                    Read Full Story
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}