import Link from "next/link";
import { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa"; // Import the cart icon from react-icons
import { FiMenu, FiX } from "react-icons/fi"; // Import burger and close icons from react-icons

import { useMenu } from "../../context/menuContext";
import MegaMenu from "./megaMenu"; // Import the MegaMenu component
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations
import { MainButton } from "../buttons";
import useStore from "@/store/store"; // Import Zustand store
import urlFor from "../../functions/urlFor";

import LogoSM from "@/assets/logoSM.png";

export default function Menu() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMegaMenuVisible, setIsMegaMenuVisible] = useState(false); // State for MegaMenu visibility
    const [isSticky, setIsSticky] = useState(false); // State to track if the header is sticky

    const menuData = useMenu(); // Access menu data from context
    const { cartItems, openCartSidebar } = useStore(); // Assuming cartItems is an array in Zustand

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
                <div className="container mx-auto flex justify-between items-center lg:p-2 2xl:p-4 relative font-semibold">
                    {/* Left Section - Links */}
                    <nav className="hidden md:flex space-x-4 text-sm 2xl:text-base">
                        <Link
                            href="/about"
                            className={`${
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
                                className="h-16 2xl:h-24 inline-block mx-auto md:mx-0"
                            />
                        </Link>
                    </div>

                    {/* Right Section - CTA Button, Cart, and Burger Menu */}
                    <div className="flex items-center space-x-4 md:space-x-4">
                        {/* CTA Button */}
                        <MainButton
                            klasse="!mt-0 !max-w-[240px] !min-w-[0]"
                            link="/shop?cat=all"
                            className="hidden md:inline-block  text-white "
                        >
                            Shop
                        </MainButton>

                        {/* Cart Icon with Badge */}
                        <button className="relative hidden md:inline-flex items-center">
                            <FaShoppingCart onClick={openCartSidebar} className="text-3xl text-gray-700" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 text-xs">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>

                        {/* Burger Menu */}
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 md:hidden">
                            {isOpen ? <FiX className="text-3xl" /> : <FiMenu className="text-3xl" />}
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
                        className="fixed top-0 left-0 w-full bg-white hidden lg:block shadow-lg z-50 font-body"
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
                                    href="/services"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    Services
                                </Link>
                                <Link href="/about" className="text-gray-700 hover:text-gray-900">
                                    Über uns
                                </Link>
                                <Link href="/contact" className="text-gray-700 hover:text-gray-900">
                                    Kontakt
                                </Link>
                            </nav>

                            {/* Center Section - Logo with Home Link */}
                            <div className="flex-1 text-center md:flex-none md:text-left">
                                <Link href="/" className="text-2xl font-bold text-gray-900">
                                    <img src={LogoSM.src} alt="Logo" className="h-12 inline-block mx-auto md:mx-0" />
                                </Link>
                            </div>

                            {/* Right Section - CTA Button, Cart */}
                            <div className="flex items-center space-x-4 md:space-x-4">
                                {/* CTA Button */}
                                <MainButton klasse="!mt-0 !max-w-[240px] !min-w-[0]" link="/shop?cat=all">
                                    Shop
                                </MainButton>

                                {/* Cart Icon with Badge */}
                                <button className="relative hidden md:inline-flex items-center">
                                    <FaShoppingCart onClick={openCartSidebar} className="text-3xl text-gray-700" />
                                    {cartItems.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 text-xs">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>
        </>
    );
}
