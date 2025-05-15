import { useEffect, useState } from "react"
import { useScroll } from "../hooks/useScroll"

export default function DualExhibition({ leftImages, rightImages }) {
    const { scrollY } = useScroll()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)

    // Make sure we have equal number of images on both sides
    const maxLength = Math.min(leftImages?.length ?? 0, rightImages?.length ?? 0)

    // Auto change both images every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            goToNextImage()
        }, 3000)

        return () => clearInterval(interval)
    }, [currentIndex])

    // Handle image navigation - both sides change simultaneously
    const goToNextImage = () => {
        if (isTransitioning) return

        setIsTransitioning(true)
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % maxLength)
            setIsTransitioning(false)
        }, 300)
    }

    const goToPrevImage = () => {
        if (isTransitioning) return

        setIsTransitioning(true)
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + maxLength) % maxLength)
            setIsTransitioning(false)
        }, 300)
    }

    return (
        <div className="flex flex-col md:flex-row w-full" id="exhibition-section">
            {/* Left side - Exhibition image only (no text overlay) */}
            <div className="w-full md:w-1/2 relative h-[400px] md:h-[600px] overflow-hidden">
                <img
                    src={leftImages?.[currentIndex] || "/placeholder.svg"}
                    alt="Exhibition artwork"
                    className={`object-cover transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"} w-full h-full`}
                />
            </div>

            {/* Right side - Mirror frame with image */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative py-12 md:py-0">
                {/* Navigation buttons - positioned outside the frame */}
                <div className="absolute top-1/2 w-full flex justify-between -translate-y-1/2 px-8 z-10">
                    <button
                        onClick={goToPrevImage}
                        className="text-gray-700 hover:text-gray-900 transition-colors bg-white/70 px-3 py-1 rounded-full shadow-md"
                        aria-label="Previous image"
                    >
                        <span className="text-sm font-medium">PREV</span>
                    </button>
                    <button
                        onClick={goToNextImage}
                        className="text-gray-700 hover:text-gray-900 transition-colors bg-white/70 px-3 py-1 rounded-full shadow-md"
                        aria-label="Next image"
                    >
                        <span className="text-sm font-medium">NEXT</span>
                    </button>
                </div>

                <div className="relative">
                    {/* Unique mirror frame design - no rotating text */}
                    <div className="w-[240px] h-[300px] md:w-[320px] md:h-[400px] relative">
                        {/* Decorative frame elements */}
                        <div className="absolute inset-0 rounded-[40%] border-[12px] border-[#f5f2ed] shadow-lg z-10"></div>

                        {/* Inner shadow effect */}
                        <div className="absolute inset-[12px] rounded-[35%] shadow-inner z-20 pointer-events-none"></div>

                        {/* Gold accent corners */}
                        <div className="absolute top-[-5px] left-[-5px] w-[40px] h-[40px] border-t-4 border-l-4 border-[#d4af37] rounded-tl-[20px] z-20"></div>
                        <div className="absolute top-[-5px] right-[-5px] w-[40px] h-[40px] border-t-4 border-r-4 border-[#d4af37] rounded-tr-[20px] z-20"></div>
                        <div className="absolute bottom-[-5px] left-[-5px] w-[40px] h-[40px] border-b-4 border-l-4 border-[#d4af37] rounded-bl-[20px] z-20"></div>
                        <div className="absolute bottom-[-5px] right-[-5px] w-[40px] h-[40px] border-b-4 border-r-4 border-[#d4af37] rounded-br-[20px] z-20"></div>

                        {/* Image container */}
                        <div className="absolute inset-[12px] rounded-[35%] overflow-hidden bg-[#f5f2ed]">
                            <img
                                src={rightImages?.[currentIndex] || "/placeholder.svg"}
                                alt="Exhibition artwork"
                                className={`object-cover transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"
                                    }`}
                                style={{ objectFit: "cover", objectPosition: "center" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Description text - Updated from BOYD's to Timeless Palette */}
                <div className="mt-12 max-w-md text-center md:text-left px-4 md:px-8">
                    <p className="text-gray-700 leading-relaxed">
                        Timeless Palette help you understand various art styles, introduce you to new trends and promising artists.
                        We will not only help you make the best creative choice, but also select pieces that will hold value,
                        doubling the benefits of your acquisition.
                    </p>
                </div>
            </div>
        </div>
    )
}
