export interface AppScreenshot {
  id: string
  src: string
  title: string
  description: string
  category: "desktop" | "mobile"
  badge: string
  tag: "dashboard" | "chart" | "ai" | "log" | "entry"
}

export const appScreenshots: AppScreenshot[] = [
  {
    id: "desktop-dashboard",
    src: "/app-scrn-shot/TradeX Desktop Dashboard.png",
    title: "Comprehensive Performance Dashboard",
    description: "Real-time Net P&L (after tax & brokerage), Win Rate analytics, trade counts, execution feed, and color-coded P/L Calendar.",
    category: "desktop",
    badge: "Desktop Dashboard",
    tag: "dashboard"
  },
  {
    id: "desktop-chart",
    src: "/app-scrn-shot/TradeX Desktop Chart.png",
    title: "Cumulative Equity & Growth Charting",
    description: "Visualize net equity trajectory over time with granular date filtering to spot performance drawdowns and win streaks.",
    category: "desktop",
    badge: "Equity Analytics",
    tag: "chart"
  },
  {
    id: "desktop-ai",
    src: "/app-scrn-shot/TradeX Desktop AI Chatbot.png",
    title: "AI Trade Strategy & Performance Assistant",
    description: "Get objective insights into your trading mistakes, risk habits, and strategy execution directly from an AI co-pilot.",
    category: "desktop",
    badge: "AI Co-pilot",
    tag: "ai"
  },
  {
    id: "mobile-overview",
    src: "/app-scrn-shot/TradeX Mobile Overview.jpeg",
    title: "Mobile Dashboard & Quick Metrics",
    description: "Track your overall win rate, total trades, and daily P&L on the go with an optimized dark mobile view.",
    category: "mobile",
    badge: "Mobile View",
    tag: "dashboard"
  },
  {
    id: "mobile-log",
    src: "/app-scrn-shot/TradeX Mobile Log.jpeg",
    title: "Historical Trade Logs & Detailed Review",
    description: "Search, filter, and review previous executions, entry/exit prices, fees, and strategy tags right from your phone.",
    category: "mobile",
    badge: "Trade History",
    tag: "log"
  },
  {
    id: "mobile-entry",
    src: "/app-scrn-shot/TradeX Mobile Entry.jpeg",
    title: "Frictionless Mobile Trade Logging",
    description: "Quickly record Intraday, Options, or Delivery trades with entry price, stop loss, quantity, fees, and notes.",
    category: "mobile",
    badge: "Trade Logger",
    tag: "entry"
  },
  {
    id: "mobile-chart",
    src: "/app-scrn-shot/TradeX Mobile Chart.jpeg",
    title: "Mobile Equity Curve & Performance Visualization",
    description: "Monitor equity curve trends, daily variations, and performance stats on high-density smartphone screens.",
    category: "mobile",
    badge: "Mobile Charts",
    tag: "chart"
  },
  {
    id: "mobile-ai",
    src: "/app-scrn-shot/TradeX Mobile AI Chatbot.jpeg",
    title: "On-the-Go AI Market & Strategy Assistant",
    description: "Ask questions about your trading rules, review trade setups, or query performance metrics wherever you are.",
    category: "mobile",
    badge: "Mobile AI",
    tag: "ai"
  }
]
