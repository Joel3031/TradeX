import { useState, useEffect } from "react"

export function useMediaQuery(query: string) {
    const [matches, setMatches] = useState<boolean>(() => {
        // Initialize state directly to avoid the useEffect synchronous set warning
        if (typeof window !== "undefined") {
            return window.matchMedia(query).matches
        }
        return false
    })

    useEffect(() => {
        const media = window.matchMedia(query)

        // Create listener function
        const listener = () => setMatches(media.matches)

        // Add event listener
        media.addEventListener("change", listener)

        // Clean up
        return () => media.removeEventListener("change", listener)
    }, [query])

    return matches
}