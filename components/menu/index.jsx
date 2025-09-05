import Link from "next/link";
import { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { FiMenu, FiX, FiUser } from "react-icons/fi";

import { useMenu } from "../../context/menuContext";
import MegaMenu from "./megaMenu";
import { motion, AnimatePresence } from "framer-motion";
import { MainButton } from "../buttons";
import useStore from "@/store/store";
import urlFor from "../../functions/urlFor";

import LogoSM from "@/assets/logoSM.png";
import useUserStore from "@/store/userStore";

import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import MobileMenu from "./mobileMenu";

import { useRouter } from "next/router";

export default function Menu() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMegaMenuVisible, setIsMegaMenuVisible] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const menuData = useMenu();
    const { cartItems, openCartSidebar } = useStore();
    const user = useUserStore((state) => state.user);
    const router = useRouter();

    const toggleUserMenu = () => setShowUserMenu((prev) => !prev);
    const closeUserMenu = () => setShowUserMenu(false);

    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > 400);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!menuData) return null;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/");
            useUserStore.setState({ user: null });
            closeUserMenu();
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    };

    const UserDropdown = () => (
        <div className="relative">
            <button onClick={toggleUserMenu} className="p-2 rounded-full hover:bg-gray-100">
                <FiUser className="text-2xl text-gray-700" />
            </button>

            {showUserMenu && (
                <div
                    className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md py-2 z-50"
                    onMouseLeave={closeUserMenu}
                >
                    {user ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                onClick={closeUserMenu}
                            >
                                Zum Account
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/signup?mode=login"
                                className="block px-4 py-2 font-semibold text-gray-800 hover:bg-gray-100"
                                onClick={closeUserMenu}
                            >
                                Login
                            </Link>
                            <Link
                                href="/signup?mode=signup"
                                className="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                                onClick={closeUserMenu}
                            >
                                Registrieren
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Original Header */}
            <header className="relative font-body">
                <div className="container mx-auto flex justify-between items-center lg:p-2 xl:py-5 2xl:py-12 relative font-semibold">
                    {/* Left */}
                    <nav className="hidden md:flex space-x-4 text-sm 2xl:text-base">
                        <Link
                            href="/shop"
                            className={`${
                                isMegaMenuVisible ? "text-primaryColor-400" : "text-textColor"
                            } hover:text-primaryColor-400`}
                            onMouseEnter={() => setIsMegaMenuVisible(true)}
                        >
                            Angebot
                        </Link>
                        <div className="relative">
                            <Link
                                onMouseEnter={() => setIsMegaMenuVisible(false)}
                                href="/about"
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

                    {/* Center Logo (Desktop) */}
                    <div className="absolute hidden lg:block left-1/2 transform -translate-x-1/2">
                        <Link href="/" className="text-2xl font-bold text-gray-900">
                            <img src={urlFor(menuData.logo).url()} alt="Logo" className="h-16 2xl:h-24 inline-block" />
                        </Link>
                    </div>

                    {/* Center Logo (Mobile) */}
                    <div className="flex-1 p-2 lg:hidden md:flex-none md:text-left">
                        <Link href="/" className="text-2xl font-bold text-gray-900">
                            <img src={LogoSM.src} alt="Logo" className="h-10 2xl:h-24 inline-block" />
                        </Link>
                    </div>

                    {/* Right */}
                    <div className="flex items-center space-x-4 md:space-x-4">
                        {/* CTA */}
                        <MainButton
                            klasse="!mt-0 !max-w-[200px] font-base !min-w-[0] px-12 !text-white hidden md:inline-block"
                            link="/shop?cat=all"
                        >
                            zum Shop
                        </MainButton>

                        {/* Mobile Burger */}
                        <button onClick={() => setIsOpen(!isOpen)} className="text-textColor pr-4 md:hidden">
                            {isOpen ? <FiX className="text-3xl" /> : <FiMenu className="text-3xl" />}
                        </button>

                        {/* User Dropdown */}
                        <UserDropdown />

                        {/* Cart */}
                        <button className="relative md:inline-flex items-center">
                            <FaShoppingCart onClick={openCartSidebar} className="text-3xl text-gray-700" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 text-xs">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* MegaMenu */}
                <div
                    className={`relative lg:-top-10 ${isMegaMenuVisible ? "block" : "hidden"}`}
                    onMouseLeave={() => setIsMegaMenuVisible(false)}
                >
                    <MegaMenu
                        data={menuData}
                        isVisible={isMegaMenuVisible}
                        onClose={() => setIsMegaMenuVisible(false)}
                    />
                </div>
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
                            {/* Left */}
                            <nav className="hidden md:flex space-x-4 text-sm 2xl:text-base">
                                <Link
                                    onMouseEnter={() => setIsMegaMenuVisible(true)}
                                    href="/services"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    Angebot
                                </Link>
                                <Link href="/about" className="text-gray-700 hover:text-gray-900">
                                    Über uns
                                </Link>
                                <Link href="/contact" className="text-gray-700 hover:text-gray-900">
                                    Kontakt
                                </Link>
                            </nav>

                            {/* Center Logo */}
                            <div className="absolute left-1/2 transform -translate-x-1/2">
                                <Link href="/" className="text-2xl font-bold text-gray-900">
                                    <img src={LogoSM.src} alt="Logo" className="h-12 inline-block" />
                                </Link>
                            </div>

                            {/* Right */}
                            <div className="flex items-center space-x-4 md:space-x-4">
                                <MainButton
                                    klasse="!mt-0 !max-w-[240px] font-base !min-w-[0] px-12 !text-white"
                                    link="/shop?cat=all"
                                >
                                    zum Shop
                                </MainButton>

                                {/* User Dropdown (Sticky) */}
                                <UserDropdown />

                                {/* Cart */}
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

                {/* MobileMenu */}
                <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} data={menuData} />
            </AnimatePresence>
        </>
    );
}
