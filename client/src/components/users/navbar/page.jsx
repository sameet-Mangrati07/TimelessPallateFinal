import { Menu } from "lucide-react";
import React, { useRef, useState } from "react";
import { useMobile } from "../../../hooks/useMobile";
import { NavLink } from "react-router-dom";
import { useUser } from "../../../contexts/userContext";

export default function Navbar() {
    const { auth } = useUser();

    const [menuOpen, setMenuOpen] = useState(false);

    const isMobile = useMobile();

    const logoRef = useRef(null);

    return (
        <header className="fixed top-0 left-0 w-full z-50 flex flex-col md:flex-row justify-between items-start px-4 py-4 bg-transparent" >
            <div ref={logoRef} className="transition-all duration-300 ease-out origin-left ">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-none mix-blend-difference">
                    <span className="block">TIMELESS</span>
                    <span className="block">PALETTE</span>
                </h1>
            </div>

            <div className="flex flex-wrap md:flex-nowrap items-start space-x-2 md:space-x-8 mt-4">
                <div className="text-right">
                    <p className="text-xs sm:text-sm text-gray-500">LOCATION:</p>
                    <p className="text-xs sm:text-sm">LONDON, UK</p>
                </div>

                <div className="text-right">
                    <p className="text-xs sm:text-sm text-gray-500">OPEN HOURS:</p>
                    <p className="text-xs sm:text-sm">24 HOUR</p>
                </div>
                {auth.xt ? (
                    <div className="text-right">
                        <p className="text-xs sm:text-sm text-gray-500">WELCOME:</p>
                        <p className="text-xs sm:text-sm">user</p>
                    </div>
                ) : (
                    <NavLink to="/login" >Login</NavLink>
                )}

                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="bg-black text-white p-2 sm:p-3 md:p-4"
                    aria-label="Toggle menu"
                >
                    <Menu size={isMobile ? 18 : 24} />
                </button>
            </div>
        </header >
    );
}
