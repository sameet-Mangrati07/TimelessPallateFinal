import { useState, useEffect, useCallback } from "react"

export function useScroll() {
    const [scrollY, setScrollY] = useState(0)

    // Use useCallback to memoize the scroll handler
    const handleScroll = useCallback(() => {
        setScrollY(window.scrollY)
    }, [])

    useEffect(() => {
        // Add event listener
        window.addEventListener("scroll", handleScroll, { passive: true })

        // Call handler right away to update scroll position
        handleScroll()

        // Remove event listener on cleanup
        return () => window.removeEventListener("scroll", handleScroll)
    }, [handleScroll]) // Only re-run if handleScroll changes (it won't due to useCallback)

    return { scrollY }
}
