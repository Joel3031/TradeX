import { useState, useEffect } from "react"

export function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        // 1. Create a media query list
        const media = window.matchMedia(query)

        // 2. Set initial value
        if (media.matches !== matches) {
            setMatches(media.matches)
        }

        // 3. Create listener function
        const listener = () => setMatches(media.matches)

        // 4. Add listener (Supports modern & older browsers)
        if (media.addEventListener) {
            media.addEventListener("change", listener)
        } else {
            // Fallback for older Safari/Edge versions
            media.addListener(listener)
        }

        // 5. Cleanup
        return () => {
            if (media.removeEventListener) {
                media.removeEventListener("change", listener)
            } else {
                media.removeListener(listener)
            }
        }
    }, [matches, query])

    return matches
}