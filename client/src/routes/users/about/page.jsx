import React, { useEffect, useRef, useState } from "react";
import { useScroll } from "../../../hooks/useScroll";
import { useMobile } from "../../../hooks/useMobile";
import { Facebook, Instagram, Menu, ShoppingBag, Twitter } from "lucide-react";
import { NavLink } from "react-router-dom";

function About() {
  const { scrollY } = useScroll();
  const isMobile = useMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const logoRef = useRef(null);
  const totalPages = 4;

  // Control logo size based on scroll position
  useEffect(() => {
    if (logoRef.current) {
      const scale = Math.max(0.8, 1 - scrollY / 1000);
      if (scrollY > 100) {
        logoRef.current.style.transform = `scale(${scale})`;
        logoRef.current.classList.add("scrolled");
      } else {
        logoRef.current.style.transform = "scale(1)";
        logoRef.current.classList.remove("scrolled");
      }
    }
  }, [scrollY]);

  // Track current page based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const page = Math.floor(scrollPosition / windowHeight) + 1;
      setCurrentPage(Math.min(page, totalPages));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalPages]);

  // Toggle menu open/closed
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-6 flex justify-between items-center">
        <div ref={logoRef} className="flex items-center transition-all duration-300">
          <h1 className="text-2xl sm:text-3xl font-bold">TIMELESS PALETTE</h1>
        </div>
        <button
          onClick={toggleMenu}
          className="bg-black text-white p-2 sm:p-3 md:p-4"
          aria-label="Open menu"
        >
          <Menu size={isMobile ? 18 : 24} />
        </button>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen relative" id="page-1">
        <div className="absolute top-0 left-0 right-0 h-screen w-full">
          <div className="grid grid-cols-12 h-full px-4">
            <div className="col-span-6 sm:col-span-6 md:col-span-5 h-full relative">
              <div className="absolute top-[160px] sm:top-[140px] md:top-[160px] left-0 right-0 bottom-0">
                <div className="relative h-[250px] sm:h-[350px] md:h-[450px]">
                  <img
                    src="/images/surya-art-1.png"
                    alt="Artistic representation of Timeless Palette"
                    className="object-contain h-[30rem]"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-6 md:col-span-3 h-full relative -ml-32">
              <div className="absolute top-[420px] sm:top-[140px] md:top-[160px] left-0 right-0 bottom-0">
                <div className="relative h-[250px] sm:h-[350px] md:h-[450px]">
                  <img
                    src="/images/surya-art-2.png"
                    alt="Modern art piece"
                    className="object-contain h-[30rem]"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4"></div>
          </div>
        </div>
        <div className="container mx-auto px-4 relative z-10 pt-[100px]">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-8"></div>
            <div className="col-span-12 md:col-span-4 flex flex-col justify-start pt-[700px] sm:pt-[500px] md:pt-[400px]">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
                ABOUT
                <br />
                TIMELESS PALETTE
              </h2>
              <p className="text-lg sm:text-xl mb-8">
                Discover our mission to redefine contemporary art through bold creativity and innovation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="min-h-screen py-20 relative" id="page-2">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-6">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                OUR VISION
              </h2>
              <p className="text-lg sm:text-xl mb-8">
                Timeless Palette was founded to disrupt traditional art spaces, embracing vibrant, modern works that spark imagination and challenge perspectives. We curate exhibitions that push boundaries and foster new ideas.
              </p>
            </div>
            <div className="col-span-12 md:col-span-6">
              <div className="aspect-[4/3] relative">
                <img src="/images/surya-art-3.png" alt="Vision artwork" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="min-h-screen py-20 relative" id="page-3">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-10">OUR VALUES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Creativity</h3>
              <p className="text-sm sm:text-base">
                We celebrate bold, innovative art that breaks free from convention.
              </p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Inclusivity</h3>
              <p className="text-sm sm:text-base">
                Our space welcomes diverse voices and perspectives in contemporary art.
              </p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Inspiration</h3>
              <p className="text-sm sm:text-base">
                We aim to ignite imagination and inspire new ways of seeing the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer/Social Section */}
      <section className="min-h-screen bg-black text-white flex flex-col items-center justify-center" id="page-4">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-8 sm:mb-16 tracking-tighter">
            TIMELESS PALETTE
          </h2>
          <div className="flex justify-center items-center space-x-6 sm:space-x-8 md:space-x-12 lg:space-x-16">
            <a
              href="https://instagram.com"
              className="transform transition-transform hover:scale-110 hover:text-gray-300"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={isMobile ? 24 : 36} />
            </a>
            <a
              href="https://facebook.com"
              className="transform transition-transform hover:scale-110 hover:text-gray-300"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook size={isMobile ? 24 : 36} />
            </a>
            <a
              href="https://twitter.com"
              className="transform transition-transform hover:scale-110 hover:text-gray-300"
              aria-label="Twitter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter size={isMobile ? 24 : 36} />
            </a>
            <NavLink
              to="/shop"
              className="transform transition-transform hover:scale-110 hover:text-gray-300"
              aria-label="Shop"
            >
              <ShoppingBag size={isMobile ? 24 : 36} />
            </NavLink>
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

      {/* Menu Overlay - Navigation menu with About highlighted */}
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
            <NavLink
              to="/"
              className={({ isActive }) => `block hover:underline ${isActive ? "font-bold" : ""}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/artists"
              className={({ isActive }) => `block hover:underline ${isActive ? "font-bold" : ""}`}
            >
              Artists
            </NavLink>
            <NavLink
              to="/visit"
              className={({ isActive }) => `block hover:underline ${isActive ? "font-bold" : ""}`}
            >
              Visit
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => `block hover:underline ${isActive ? "font-bold" : ""}`}
            >
              About
            </NavLink>
            <NavLink
              to="/shop"
              className={({ isActive }) => `block hover:underline ${isActive ? "font-bold" : ""}`}
            >
              Shop
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => `block hover:underline ${isActive ? "font-bold" : ""}`}
            >
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
    </main>
  );
}

export default About;