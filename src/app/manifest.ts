import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TradeX — Trading Journal & Analytics',
    short_name: 'TradeX',
    description: 'Track trades, analyze performance, and refine your trading strategy.',
    start_url: '/app',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
