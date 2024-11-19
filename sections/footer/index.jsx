import React from "react";
import Link from "next/link";
import { FiMail, FiPhone } from "react-icons/fi"; // Import email and phone icons
import { FaInstagram, FaFacebook } from "react-icons/fa"; // Import social media icons
import Logo from "@/assets/logoSM.png";

// TYPOGRAPHY
import { H1, H3, H4, P } from "../../components/typography";

const Footer = () => {
    return (
        <div className="bg-blackColor w-full py-36 font-body lg:mt-24">
            <div className="container mx-auto grid grid-cols-12">
                <div className="col-span-6">
                    <img src={Logo.src} alt="Mainplott Logo" />
                </div>
                <div className="col-span-2">
                    <Link href="#" className="text-primaryColor-50 text-xl block font-semibold">
                        Kontakt
                    </Link>
                    <Link href="#" className="text-primaryColor-50 text-xl block font-semibold">
                        Datenschutz
                    </Link>
                    <Link href="#" className="text-primaryColor-50 text-xl block font-semibold">
                        Impressum
                    </Link>
                </div>
                <div className="col-span-2">
                    <div className="text-primaryColor-50 text-xl block font-semibold">MAINPLOTT</div>
                    <div className="text-primaryColor-50 text-xl block font-regular">
                        Neue Straße 528
                        <br />
                        28232 Musterstadt
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="flex items-center mb-2">
                        <FiMail className="text-primaryColor-50 text-2xl mr-3" />
                        <span className="text-primaryColor-50 text-lg">office@mainplott.de</span>
                    </div>
                    <div className="flex items-center">
                        <FiPhone className="text-primaryColor-50 text-2xl mr-3" />
                        <span className="text-primaryColor-50 text-lg">+43 123 456 789</span>
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
