// components/MobileMenu.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FiX, FiChevronDown, FiChevronUp, FiUser, FiPhoneCall } from "react-icons/fi";
import { FaShoppingCart, FaWhatsapp } from "react-icons/fa";
import useStore from "@/store/store"; // For cartItems, openCartSidebar
import useUserStore from "@/store/userStore";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import urlFor from "@/functions/urlFor";
import LogoSM from "@/assets/logoSM.png";

/**
 * MobileMenu
 *
 * Props:
 * - isOpen: boolean (controls if the side menu is open)
 * - onClose: function to close the menu
 * - data: the menuData (including .menu array for MegaMenu items)
 */

export default function MobileMenu({ isOpen, onClose, data }) {
    const { cartItems, openCartSidebar } = useStore();
    const user = useUserStore((state) => state.user);

    // For "Mega Menu" expansions
    const [megaOpen, setMegaOpen] = useState(false);

    // Slide-in from the right - snappier animation
    const menuVariants = {
        hidden: { x: "100%" },
        visible: { x: 0 },
        exit: { x: "100%" },
    };

    // Sub-menu for MegaMenu items - also snappier
    const subMenuVariants = {
        collapsed: { height: 0, opacity: 0 },
        expanded: { height: "auto", opacity: 1 },
    };

    // Logging out
    const handleLogout = async () => {
        try {
            await signOut(auth);

            // Optionally reset the user in your Zustand store
            useUserStore.setState({ user: null });
            onClose();
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Dark Overlay */}
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />

                    {/* Side Drawer */}
                    <motion.div
                        className="fixed top-0 right-0 w-[80%] max-w-sm h-full bg-white z-50 shadow-lg flex flex-col font-body"
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.25, ease: [0.45, 0.05, 0.55, 0.95] }}
                    >
                        {/* Header Row */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="font-bold text-xl">
                                <img className="w-12" src={LogoSM.src} alt="logo" />
                            </div>
                            <button onClick={onClose}>
                                <FiX className="text-2xl text-gray-600" />
                            </button>
                        </div>

                        {/* Scrollable Nav Section */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Sample Nav Links */}{" "}
                            <button
                                onClick={() => setMegaOpen(!megaOpen)}
                                className="flex items-center justify-between w-full text-lg text-left text-gray-700 hover:text-primaryColor-400"
                            >
                                <span>Services</span>
                                {megaOpen ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                            {/* Collapsible MegaMenu Items */}
                            <AnimatePresence>
                                {megaOpen && (
                                    <motion.div
                                        className="mt-2 ml-4 border-l-2 border-primaryColor-200 pl-2"
                                        variants={subMenuVariants}
                                        initial="collapsed"
                                        animate="expanded"
                                        exit="collapsed"
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                    >
                                        {data?.menu?.map((item, index) => (
                                            <div key={index} className="mb-4">
                                                <Link
                                                    href={`/${item.title}`}
                                                    onClick={onClose}
                                                    className="block text-sm font-semibold mb-1 text-gray-700 hover:text-primaryColor-600"
                                                >
                                                    {item.title}
                                                </Link>
                                                {/* Optional sub-items */}
                                                {item?.menuItems?.map((sub, i) => (
                                                    <div key={i} className="ml-4 mb-1 flex items-center space-x-2">
                                                        {sub.image && (
                                                            <img
                                                                src={urlFor(sub.image).url()}
                                                                alt=""
                                                                className="w-4 h-4"
                                                            />
                                                        )}
                                                        <Link
                                                            href={`/${sub.link}`}
                                                            onClick={onClose}
                                                            className="text-sm text-gray-500 hover:text-primaryColor-600"
                                                        >
                                                            {sub.text}
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <Link
                                href="/about"
                                onClick={onClose}
                                className="block text-lg text-gray-700 hover:text-primaryColor-400"
                            >
                                Über uns
                            </Link>
                            {/* Mega Menu Toggle */}
                            <Link
                                href="/contact"
                                onClick={onClose}
                                className="block text-lg text-gray-700 hover:text-primaryColor-400"
                            >
                                Kontakt
                            </Link>
                            {/* Shop Button Under The Text
                            <Link
                                href="/shop?cat=all"
                                onClick={onClose}
                                className="block text-center mt-4 py-2 bg-primaryColor text-white rounded-md text-lg shadow-sm hover:shadow-md transition"
                            >
                                Zum Shop
                            </Link> */}
                            {/* Login/Logout with Icon */}
                            <div className="flex items-center gap-2 mt-4">
                                <FiUser className="text-xl text-primaryColor-600" />
                                {!user ? (
                                    <Link
                                        href="/signup?mode=login"
                                        onClick={onClose}
                                        className="text-lg text-gray-700 hover:text-primaryColor-400"
                                    >
                                        Login
                                    </Link>
                                ) : (
                                    <button
                                        onClick={handleLogout}
                                        className="text-lg text-gray-700 hover:text-primaryColor-400"
                                    >
                                        Logout
                                    </button>
                                )}
                            </div>
                            <Link
                                href="/shop"
                                onClick={onClose}
                                className="block text-lg !mt-8 bg-primaryColor-400 py-3 px-6 text-white rounded-lg hover:text-white"
                            >
                                zum Shop
                            </Link>
                        </div>

                        {/* Bottom Row: Contact Data & Call/WhatsApp Buttons */}
                        <div className="p-4 border-t bg-gray-50">
                            {/* Mainplott Address */}
                            <div className="mb-4 text-sm text-gray-600 leading-5">
                                <strong>MAINPLOTT</strong>
                                <br />
                                Schießbergstr. 4
                                <br />
                                63303 Dreieich
                                <br />
                                info@mainplott.de
                            </div>

                            <div className="flex flex-col gap-2">
                                {/* Call Button */}
                                <a
                                    href="tel:+491743177690"
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primaryColor text-white rounded-md hover:bg-primaryColor-600 transition"
                                >
                                    <FiPhoneCall />
                                    Anrufen
                                </a>

                                {/* WhatsApp Button */}
                                <a
                                    href="https://wa.me/491783380649"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                                >
                                    <FaWhatsapp />
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
