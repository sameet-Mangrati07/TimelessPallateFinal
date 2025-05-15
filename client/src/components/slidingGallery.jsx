import { useEffect, useRef } from "react"
import { useScroll } from "../hooks/useScroll"

export default function SlidingGallery({ topimgs, bottomimgs }) {
    const { scrollY } = useScroll()
    const topRowRef = useRef(null);
    const bottomRowRef = useRef(null);

    useEffect(() => {
        if (topRowRef.current && bottomRowRef.current) {
            // Calculate the translation based on scroll position
            // The division factor controls the speed of the sliding effect
            const translateX = scrollY / 10

            // Move the top row to the left and bottom row to the right
            topRowRef.current.style.transform = `translateX(-${translateX}px)`
            bottomRowRef.current.style.transform = `translateX(${translateX}px)`
        }
    }, [scrollY])

    return (
        <div className="w-full overflow-hidden px-[0.5cm]">
            {/* Top row - slides left */}
            <div
                ref={topRowRef}
                className="flex transition-transform duration-100 ease-linear py-3"
                style={{ width: `${topimgs.length * 100}%` }}
            >
                {topimgs.map((src, index) => (
                    <div key={`top-${index}`} className="w-1/4 px-1">
                        <div className="relative h-[300px] overflow-hidden">
                            <img
                                src={src || "/placeholder.svg"}
                                alt={`Gallery artwork ${index + 1}`}
                                className="object-cover rounded-lg"
                            />
                        </div>
                    </div>
                ))}
                {/* Duplicate images for infinite scroll effect */}
                {topimgs.map((src, index) => (
                    <div key={`top-dup-${index}`} className="w-1/4 px-1">
                        <div className="relative h-[300px] overflow-hidden">
                            <img
                                src={src || "/placeholder.svg"}
                                alt={`Gallery artwork ${index + 1}`}
                                className="object-cover rounded-lg"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom row - slides right */}
            <div
                ref={bottomRowRef}
                className="flex transition-transform duration-100 ease-linear py-3"
                style={{ width: `${bottomimgs.length * 100}%` }}
            >
                {bottomimgs.map((src, index) => (
                    <div key={`bottom-${index}`} className="w-1/4 px-1">
                        <div className="relative h-[300px] overflow-hidden">
                            <img
                                src={src || "/placeholder.svg"}
                                alt={`Gallery artwork ${index + 5}`}
                                className="object-cover rounded-lg"
                            />
                        </div>
                    </div>
                ))}
                {/* Duplicate images for infinite scroll effect */}
                {bottomimgs.map((src, index) => (
                    <div key={`bottom-dup-${index}`} className="w-1/4 px-1">
                        <div className="relative h-[300px] overflow-hidden">
                            <img
                                src={src || "/placeholder.svg"}
                                alt={`Gallery artwork ${index + 5}`}
                                className="object-cover rounded-lg"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
