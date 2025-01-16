import React from "react";
import Link from "next/link";
import { FiMail, FiPhone } from "react-icons/fi"; // Import email and phone icons
import { FaInstagram, FaFacebook } from "react-icons/fa"; // Import social media icons
import Logo from "@/assets/logoSM.png";

// TYPOGRAPHY
import { H1, H3, H4, P } from "../../components/typography";

const Footer = () => {
    return (
        <div className="bg-blackColor w-full px-4 lg:px-0 py-16 lg:py-36 font-body lg:mt-24">
            <div className="container mx-auto grid grid-cols-12">
                <div className="col-span-6 lg:col-span-6">
                    <img src={Logo.src} alt="Mainplott Logo" />
                </div>
                <div className="col-span-6 lg:col-span-2">
                    <Link href="/contact" className="text-primaryColor-50 lg:text-xl block font-semibold">
                        Kontakt
                    </Link>
                    <Link href="/datenschutz" className="text-primaryColor-50 lg:text-xl block font-semibold">
                        Datenschutz
                    </Link>
                    <Link href="/impressum" className="text-primaryColor-50 lg:text-xl block font-semibold">
                        Impressum
                    </Link>
                </div>
                <div className="col-span-6 lg:col-span-2 mt-4 lg:mt-0">
                    <div className="text-primaryColor-50 lg:text-xl block font-semibold">MAINPLOTT</div>
                    <div className="text-primaryColor-50 lg:text-xl block font-regular">
                        Schießbergstr. 4
                        <br />
                        63303 Dreieich
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-2 mt-8 lg:mt-0">
                    <div className="flex items-center mb-2">
                        <FiMail className="text-primaryColor-50 text-2xl mr-3" />
                        <span className="text-primaryColor-50 lg:text-lg">info@mainplott.de</span>
                    </div>
                    <div className="flex items-center">
                        <FiPhone className="text-primaryColor-50 text-2xl mr-3" />
                        <span className="text-primaryColor-50 lg:text-lg">+49 174 / 3177690</span>
                    </div>
                    <div className="flex mt-8 space-x-8">
                        <Link href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                            <FaInstagram className="text-primaryColor text-3xl hover:text-primaryColor transition-all duration-300" />
                        </Link>
                        <Link href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                            <FaFacebook className="text-primaryColor text-3xl hover:text-primaryColor transition-all duration-300" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;
