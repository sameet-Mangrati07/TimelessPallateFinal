import React, { useEffect, useRef, useState } from "react";
import { useScroll } from "../../../hooks/useScroll";
import { useMobile } from "../../../hooks/useMobile";
import { ChevronLeft, ChevronRight, Farcebook, Instagram, Menu, ShoppingBag, Twitter } from "lucide-react";
import SlidingGallery from "../../../components/slidingGallery";
import DualExhibition from "../../../components/dualExhibition";
import { NavLink } from "react-router-dom";

function Index() {
    const { scrollY } = useScroll();
    const isMobile = useMobile();
    const [menuOpen, setMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const logoRef = useRef(null);
    const taglineRef = useRef(null);
    const totalPages = 9;

    // Control logo size and opacity based on scroll position
    useEffect(() => {
        if (logoRef.current) {
            // Adjust the scale factor to make the shrinking more subtle
            const scale = Math.max(0.8, 1 - scrollY / 1000)

            // Apply different transformations based on scroll position
            if (scrollY > 100) {
                // When scrolled, make logo smaller but keep vertical stacking
                logoRef.current.style.transform = `scale(${scale})`
                logoRef.current.classList.add("scrolled")
            } else {
                // When at top, keep logo large and stacked
                logoRef.current.style.transform = "scale(1)"
                logoRef.current.classList.remove("scrolled")
            }
        }
    }, [scrollY])

    // Track current page based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY
            const windowHeight = window.innerHeight

            // Calculate current page based on scroll position
            const page = Math.floor(scrollPosition / windowHeight) + 1
            setCurrentPage(Math.min(page, totalPages))
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [totalPages])

    // Control tagline visibility based on current page
    useEffect(() => {
        if (taglineRef.current) {
            if (currentPage >= 2 && currentPage <= 5) {
                taglineRef.current.style.opacity = "1"
            } else {
                taglineRef.current.style.opacity = "0"
            }
        }
    }, [currentPage])

    // Toggle menu open/closed
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    }

    // Scroll to exhibition section
    const scrollToExhibition = () => {
        const exhibitionSection = document.getElementById("page-8")
        if (exhibitionSection) {
            exhibitionSection.scrollIntoView({ behavior: "smooth" })
            setMenuOpen(false) // Close menu after navigation
        }
    }

    // Gallery images for the sliding gallery
    const topRowimgs = ["/images/wall-1.jpeg", "/images/wall-2.jpeg", "/images/wall-3.jpeg", "/images/wall-4.jpeg"]
    const bottomRowimgs = ["/images/wall-5.jpeg", "/images/wall-6.jpeg", "/images/wall-7.jpeg", "/images/wall-8.jpeg"]

    // Exhibition images - paired for synchronized display
    const leftimgs = [
        "/images/exhibition-1.jpeg",
        "/images/exhibition-2.jpeg",
        "/images/exhibition-3.jpeg",
        "/images/exhibition-4.jpeg",
    ]

    const rightimgs = [
        "/images/mirrol-1.jpeg",
        "/images/mirrol-2.jpeg",
        "/images/mirrol-3.jpeg",
        "/images/mirrol-4.jpeg",
    ]

    return (
        <main className="min-h-screen bg-white overflow-hidden">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 z-50 px-4 py-6 flex justify-between items-center">
                {/* Logo */}
                <div ref={logoRef} className="flex items-center transition-all duration-300">
                    <h1 className="text-2xl sm:text-3xl font-bold">TIMELESS PALETTE</h1>
                </div>
                
                {/* Menu Button */}
                <button 
                    onClick={toggleMenu} 
                    className="bg-black text-white p-2 sm:p-3 md:p-4"
                    aria-label="Open menu"
                >
                    <Menu size={isMobile ? 18 : 24} />
                </button>
            </header>

            {/* Hero Section with background image that touches the top edge */}
            <section className="min-h-screen relative" id="page-1">
                {/* Background images positioned absolutely to touch the top edge */}
                <div className="absolute top-0 left-0 right-0 h-screen w-full">
                    <div className="grid grid-cols-12 h-full px-4">
                        {/* Left image - Precisely aligned with the "T" in TIMELESS */}
                        <div className="col-span-6 sm:col-span-6 md:col-span-5 h-full relative">
                            <div className="absolute top-[160px] sm:top-[140px] md:top-[160px] left-0 right-0 bottom-0">
                                <div className="relative h-[250px] sm:h-[350px] md:h-[450px]">
                                    <img
                                        src="/images/surya-art-1.png"
                                        alt="Artistic portrait with clock elements"
                                        className="object-contain h-[30rem]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right image - moved closer with reduced gap */}
                        <div className="col-span-12 sm:col-span-6 md:col-span-3 h-full relative -ml-32">
                            <div className="absolute top-[420px] sm:top-[140px] md:top-[160px] left-0 right-0 bottom-0">
                                <div className="relative h-[250px] sm:h-[350px] md:h-[450px]">
                                    <img
                                        src="/images/surya-art-2.png"
                                        alt="Dark portrait with time elements"
                                        className="object-contain h-[30rem]"
                                        
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Empty space for text section */}
                        <div className="col-span-12 md:col-span-4"></div>
                    </div>
                </div>

                {/* Content positioned to account for the header and images */}
                <div className="container mx-auto px-4 relative z-10 pt-[100px]">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Skip the image columns as they're positioned absolutely */}
                        <div className="col-span-12 md:col-span-8"></div>

                        {/* Text section */}
                        <div className="col-span-12 md:col-span-4 flex flex-col justify-start pt-[700px] sm:pt-[500px] md:pt-[400px]">
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
                                A SPACE FOR
                                <br />
                                BOLD ART AND
                                <br />
                                NEW IDEAS
                            </h2>

                            <div className="flex items-center justify-between mb-8">
                                <p className="text-lg sm:text-xl">Popular Now</p>
                                <div className="flex space-x-2">
                                    <button className="p-1" aria-label="Previous">
                                        <ChevronLeft size={isMobile ? 16 : 20} />
                                    </button>
                                    <button className="p-1" aria-label="Next">
                                        <ChevronRight size={isMobile ? 16 : 20} />
                                    </button>
                                </div>
                            </div>

                            {/* Featured artwork in light gray card box */}
                            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg mt-auto shadow-sm">
                                <div className="aspect-[4/3] relative mx-auto max-w-[85%]">
                                    <img src="/images/surya-art-3.png" alt="Featured artwork" className="object-contain" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Fixed Tagline (visible only on pages 2-5) */}
            <div
                ref={taglineRef}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-30 transition-opacity duration-500 opacity-0 px-4"
            >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl">
                    TIMELESS PALETTE EMBRACES VIBRANT MODERN ART SPARKING IMAGINATION, DISRUPTING LIMITS, AND RESHAPING VIEWS
                </h2>
            </div>

            {/* Menu Overlay */}
            {menuOpen && (
                <div className="fixed inset-0 bg-white z-40 flex items-center justify-center">
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="absolute top-4 right-4 bg-black text-white p-2 sm:p-3 md:p-4"
                        aria-label="Close menu"
                    >
                        <Menu size={isMobile ? 18 : 24} />
                    </button>
                    <nav className="text-xl sm:text-2xl md:text-3xl space-y-4 sm:space-y-6">
                        <button onClick={scrollToExhibition} className="block hover:underline text-left w-full">
                            Exhibitions
                        </button>
                        <a href="#" className="block hover:underline">
                            Artists
                        </a>
                        <a href="#" className="block hover:underline">
                            Visit
                        </a>
                        <a href="#" className="block hover:underline">
                            About
                        </a>
                        <a href="#" className="block hover:underline">
                            Shop
                        </a>
                        <NavLink to="/contact" className="block hover:underline">
                            Contact
                        </NavLink>
                    </nav>
                </div>
            )}

            {/* Page Indicator */}
            <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-50 bg-white bg-opacity-80 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full">
                <span className="text-xs sm:text-sm font-medium">
                    {currentPage} / {totalPages}
                </span>
            </div>

            {/* Content Container - Ensures proper spacing below header */}
            <div className="content-container">
                {/* Gallery Sections - Pages 2-6 */}
                <section className="min-h-screen py-20 relative" id="page-2">
                    <div className="ml-2 md:ml-5 max-w-[90%] md:max-w-[45%]">
                        <div className="aspect-[4/3] relative">
                            <img src="/images/surya-art-4.png" alt="Gallery artwork" className="object-cover" />
                        </div>
                    </div>
                </section>

                <section className="min-h-screen py-20 relative" id="page-3">
                    <div className="mr-2 md:mr-5 ml-auto max-w-[90%] md:max-w-[45%]">
                        <div className="aspect-[4/3] relative">
                            <img src="/images/surya-art-1.png" alt="Gallery artwork" className="object-cover" />
                        </div>
                    </div>
                </section>

                <section className="min-h-screen py-20 relative" id="page-4">
                    <div className="ml-2 md:ml-5 max-w-[90%] md:max-w-[45%]">
                        <div className="aspect-[4/3] relative">
                            <img src="/images/surya-art-2.png" alt="Gallery artwork" className="object-cover" />
                        </div>
                    </div>
                </section>

                <section className="min-h-screen py-20 relative" id="page-5">
                    <div className="mr-2 md:mr-5 ml-auto max-w-[90%] md:max-w-[45%]">
                        <div className="aspect-[4/3] relative">
                            <img src="/images/surya-art-3.png" alt="Gallery artwork" className="object-cover" />
                        </div>
                    </div>
                </section>

                <section className="min-h-screen py-20 relative" id="page-6">
                    <div className="ml-2 md:ml-5 max-w-[90%] md:max-w-[45%]">
                        <div className="aspect-[4/3] relative">
                            <img src="/images/surya-art-4.png" alt="Gallery artwork" className="object-cover" />
                        </div>
                    </div>
                </section>

                {/* Sliding Gallery - Page 7 */}
                <section className="min-h-screen py-20 flex flex-col justify-center" id="page-7">
                    <div className="w-full">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6 sm:mb-10 text-center">
                            ARTISTIC
                            <br />
                            EXPRESSIONS
                        </h2>
                        <p className="text-lg sm:text-xl mb-8 sm:mb-12 text-center">Scroll to experience the movement of art</p>

                        <SlidingGallery topimgs={topRowimgs} bottomimgs={bottomRowimgs} />
                    </div>
                </section>

                {/* Exhibition Section - Page 8 */}
                <section className="min-h-screen flex items-center" id="page-8">
                    <div className="w-full">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6 sm:mb-10 text-center">EXHIBITION BY TIMELESS PALETTE</h2>
                        <DualExhibition leftImages={leftimgs} rightImages={rightimgs} />
                    </div>
                </section>

                {/* Contact/Social Section - Page 9 */}
                <section className="min-h-screen bg-black text-white flex flex-col items-center justify-center" id="page-9">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-8 sm:mb-16 tracking-tighter">
                            TIMELESS PALETTE
                        </h2>

                        <div className="flex justify-center items-center space-x-6 sm:space-x-8 md:space-x-12 lg:space-x-16">
                            <a
                                href="#"
                                className="transform transition-transform hover:scale-110 hover:text-gray-300"
                                aria-label="Instagram"
                            >
                                <Instagram size={isMobile ? 24 : 36} />
                            </a>
                            <a
                                href="#"
                                className="transform transition-transform hover:scale-110 hover:text-gray-300"
                                aria-label="Facebook"
                            >
                                <Facebook size={isMobile ? 24 : 36} />
                            </a>
                            <a
                                href="#"
                                className="transform transition-transform hover:scale-110 hover:text-gray-300"
                                aria-label="Twitter"
                            >
                                <Twitter size={isMobile ? 24 : 36} />
                            </a>
                            <a
                                href="#"
                                className="transform transition-transform hover:scale-110 hover:text-gray-300"
                                aria-label="Shop"
                            >
                                <ShoppingBag size={isMobile ? 24 : 36} />
                            </a>
                        </div>

                        <div className="mt-8 sm:mt-16 max-w-xl mx-auto">
                            <p className="text-sm sm:text-base md:text-lg text-gray-400">
                                Connect with us on social media or visit our shop to explore our curated collection of contemporary art.
                            </p>
                        </div>

                        <div className="mt-8 sm:mt-16">
                            <p className="text-xs sm:text-sm text-gray-500">
                                © {new Date().getFullYear()} Timeless Palette. All rights reserved.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}

export default Index