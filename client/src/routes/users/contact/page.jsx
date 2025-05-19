import React, { useState, useEffect, useRef } from "react";
import { useMobile } from "../../../hooks/useMobile";
import { useScroll } from "../../../hooks/useScroll";
import { Mail, Phone, MapPin, Send, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

function Contact() {
    const isMobile = useMobile();
    const { scrollY } = useScroll();
    const formRef = useRef(null);
    const logoRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [formStatus, setFormStatus] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 4; // Header, Contact Form, Map, Footer

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus("sending");
        setTimeout(() => {
            setFormStatus("success");
            setFormData({
                name: "",
                email: "",
                subject: "",
                message: ""
            });
            setTimeout(() => {
                setFormStatus(null);
            }, 3000);
        }, 1500);
    };

    // Toggle menu open/closed
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

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

    return (
        <main className="min-h-screen bg-white">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 z-50 px-4 py-6 flex justify-between items-center bg-white">
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

            {/* Menu Overlay - Navigation menu with Contact highlighted */}
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

            {/* Header with large title */}
            <section className="pt-32 pb-16 px-4" id="page-1">
                <div className="container mx-auto">
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8">
                        CONTACT US
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl">
                        We'd love to hear from you. Reach out for inquiries about exhibitions, artists, or collaborations.
                    </p>
                </div>
            </section>

            {/* Content grid */}
            <section className="py-16 px-4" id="page-2">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {/* Contact information */}
                        <div>
                            <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
                            <div className="space-y-8">
                                <div className="flex items-start">
                                    <div className="bg-black text-white p-3 mr-4">
                                        <Mail size={isMobile ? 18 : 24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium mb-1">Email Us</h3>
                                        <p className="text-gray-600">info@timelesspalette.com</p>
                                        <p className="text-gray-600">exhibitions@timelesspalette.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-black text-white p-3 mr-4">
                                        <Phone size={isMobile ? 18 : 24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium mb-1">Call Us</h3>
                                        <p className="text-gray-600">+1 (555) 123-4567</p>
                                        <p className="text-gray-600">Mon-Fri: 9am-5pm</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-black text-white p-3 mr-4">
                                        <MapPin size={isMobile ? 18 : 24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium mb-1">Visit Us</h3>
                                        <p className="text-gray-600">123 Gallery Avenue</p>
                                        <p className="text-gray-600">Art District, NY 10001</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12">
                                <h3 className="text-xl font-bold mb-4">Gallery Hours</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Monday - Friday</span>
                                        <span>10am - 6pm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday</span>
                                        <span>11am - 5pm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday</span>
                                        <span>Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Contact form */}
                        <div>
                            <h2 className="text-3xl font-bold mb-8">Send a Message</h2>
                            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full border-b-2 border-black py-2 px-1 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full border-b-2 border-black py-2 px-1 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full border-b-2 border-black py-2 px-1 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="4"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full border-b-2 border-black py-2 px-1 focus:outline-none"
                                        required
                                    ></textarea>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="bg-black text-white px-6 py-3 flex items-center transition hover:bg-gray-800"
                                        disabled={formStatus === "sending"}
                                    >
                                        {formStatus === "sending" ? (
                                            <>Sending...</>
                                        ) : formStatus === "success" ? (
                                            <>Message Sent!</>
                                        ) : (
                                            <>
                                                Send Message
                                                <Send size={16} className="ml-2" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map section */}
            <section className="py-16" id="page-3">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8 text-center">Find Us</h2>
                    <div className="h-96 bg-gray-200">
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-gray-500">Map placeholder - integrate Google Maps API here</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black text-white py-16" id="page-4">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">TIMELESS PALETTE</h3>
                            <p className="text-gray-400">
                                A space for bold art and new ideas, dedicated to showcasing contemporary artistic expressions.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li>
                                    <NavLink to="/" className="text-gray-400 hover:text-white">
                                        Home
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/about" className="text-gray-400 hover:text-white">
                                        About
                                    </NavLink>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Exhibitions
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Artists
                                    </a>
                                </li>
                                <li>
                                    <NavLink to="/shop" className="text-gray-400 hover:text-white">
                                        Shop
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/contact" className="text-gray-400 hover:text-white">
                                        Contact
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
                            <p className="text-gray-400 mb-4">
                                Subscribe to receive updates on new exhibitions and events.
                            </p>
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="bg-gray-800 text-white px-4 py-2 flex-grow focus:outline-none"
                                />
                                <button className="bg-white text-black px-4 py-2">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                        <p className="text-gray-500">
                            © {new Date().getFullYear()} Timeless Palette. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Page Indicator */}
            <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-50 bg-white bg-opacity-80 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full">
                <span className="text-xs sm:text-sm font-medium">
                    {currentPage} / {totalPages}
                </span>
            </div>
        </main>
    );
}

export default Contact;