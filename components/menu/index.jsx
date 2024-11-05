import Link from "next/link";
import { useState, useEffect } from "react";
import { useMenu } from "../../context/menuContext";
import MegaMenu from "./megaMenu"; // Import the MegaMenu component
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations

// FUNCTIONS
import urlFor from "../../functions/urlFor";

export default function Menu() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMegaMenuVisible, setIsMegaMenuVisible] = useState(false); // State for MegaMenu visibility
    const [isSticky, setIsSticky] = useState(false); // State to track if the header is sticky

    const menuData = useMenu(); // Access menu data from context

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!menuData) return null; // Render nothing until data is loaded

    return (
        <>
            {/* Original Header */}
            <header className="relative font-body">
                <div className="container mx-auto flex justify-between items-center p-4 relative font-semibold">
                    {/* Left Section - Links */}
                    <nav className="hidden md:flex space-x-4">
                        <Link
                            href="/about"
                            className={` ${
                                isMegaMenuVisible ? "text-primaryColor-400" : "text-textColor"
                            } hover:text-primaryColor-400`}
                            onMouseEnter={() => setIsMegaMenuVisible(true)}
                        >
                            Services
                        </Link>
                        <div className="relative">
                            <Link
                                onMouseEnter={() => setIsMegaMenuVisible(false)}
                                href="/services"
                                className="text-gray-700 hover:text-primaryColor-400"
                            >
                                Über uns
                            </Link>
                        </div>
                        <Link
                            onMouseEnter={() => setIsMegaMenuVisible(false)}
                            href="/contact"
                            className="text-gray-700 hover:text-primaryColor-400"
                        >
                            Kontakt
                        </Link>
                    </nav>

                    {/* Center Section - Logo with Home Link */}
                    <div className="flex-1 text-center md:flex-none md:text-left">
                        <Link href="/" className="text-2xl font-bold text-gray-900">
                            <img
                                src={urlFor(menuData.logo).url()}
                                alt="Logo"
                                className="h-16 lg:h-24 inline-block mx-auto md:mx-0"
                            />
                        </Link>
                    </div>

                    {/* Right Section - CTA Button, Cart, and Burger Menu */}
                    <div className="flex items-center space-x-4 md:space-x-4">
                        {/* CTA Button */}
                        <Link
                            href="/shop"
                            className="hidden md:inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Buy Now
                        </Link>

                        {/* Cart Icon */}
                        <button className="hidden md:inline-block relative">
                            <span className="material-icons text-3xl text-gray-700">shopping_cart</span>
                            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 text-xs">
                                3
                            </span>
                        </button>

                        {/* Burger Menu */}
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 md:hidden">
                            <span className="material-icons text-3xl">menu</span>
                        </button>
                    </div>
                </div>

                {/* MegaMenu positioned outside individual links for full container width */}
                <div
                    className={`relative lg:-top-10 ${isMegaMenuVisible ? "block" : "hidden"}`}
                    onMouseLeave={() => setIsMegaMenuVisible(false)}
                >
                    <MegaMenu data={menuData} isVisible={isMegaMenuVisible} />
                </div>

                {/* Mobile Menu - Toggle visibility */}
                {isOpen && (
                    <div className="bg-gray-100 p-4 md:hidden">
                        <nav className="space-y-4 text-center">
                            <Link href="/about" className="text-gray-700 hover:text-gray-900 block">
                                About
                            </Link>
                            <Link href="/services" className="text-gray-700 hover:text-gray-900 block">
                                Services
                            </Link>
                            <Link href="/contact" className="text-gray-700 hover:text-gray-900 block">
                                Contact
                            </Link>
                        </nav>
                    </div>
                )}
            </header>
            {/* Sticky Header */}
            <AnimatePresence>
                {isSticky && (
                    <motion.header
                        className="fixed top-0 left-0 w-full bg-white shadow-lg z-50 font-body"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="container mx-auto flex justify-between items-center p-4 relative font-semibold">
                            {/* Left Section - Links */}
                            <nav className="hidden md:flex space-x-4">
                                <Link
                                    onMouseEnter={() => setIsMegaMenuVisible(true)}
                                    href="/about"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    About
                                </Link>
                                <Link href="/services" className="text-gray-700 hover:text-gray-900">
                                    Services
                                </Link>
                                <Link href="/contact" className="text-gray-700 hover:text-gray-900">
                                    Contact
                                </Link>
                            </nav>

                            {/* Center Section - Logo with Home Link */}
                            <div className="flex-1 text-center md:flex-none md:text-left">
                                <Link href="/" className="text-2xl font-bold text-gray-900">
                                    <img
                                        src={urlFor(menuData.logo).url()}
                                        alt="Logo"
                                        className="h-20 inline-block mx-auto md:mx-0"
                                    />
                                </Link>
                            </div>

                            {/* Right Section - CTA Button, Cart */}
                            <div className="flex items-center space-x-4 md:space-x-4">
                                {/* CTA Button */}
                                <Link
                                    href="/shop"
                                    className="hidden md:inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Buy Now
                                </Link>

                                {/* Cart Icon */}
                                <button className="hidden md:inline-block relative">
                                    <span className="material-icons text-3xl text-gray-700">shopping_cart</span>
                                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 text-xs">
                                        3
                                    </span>
                                </button>
                            </div>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>
        </>
    );
}
