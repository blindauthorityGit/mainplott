import React from "react";
import Link from "next/link";
import { FiMail, FiPhone } from "react-icons/fi"; // Import email and phone icons

// TYPOGRAPHY
import { H1, H3, H4, P } from "../../components/typography";
// ASSETS
import Galerie from "../../assets/test/galerie.jpg";

const Footer = () => {
    return (
        <div className="bg-blackColor w-full py-36 font-body lg:mt-24">
            <div className="container mx-auto grid grid-cols-12">
                <div className="col-span-6">
                    <H3 klasse="text-primaryColor-50">MAINPLOTT</H3>
                    <div className="mt-4">
                        <div className="flex items-center mb-2">
                            <FiMail className="text-primaryColor-50 text-2xl mr-3" />
                            <span className="text-primaryColor-50 text-lg">office@atelierbuchner.at</span>
                        </div>
                        <div className="flex items-center">
                            <FiPhone className="text-primaryColor-50 text-2xl mr-3" />
                            <span className="text-primaryColor-50 text-lg">+43 123 456 789</span>
                        </div>
                    </div>
                </div>
                <div className="col-span-2">
                    <Link href="#" className="text-primaryColor-50 text-xl block font-semibold">
                        Partner
                    </Link>
                    <Link href="#" className="text-primaryColor-50 text-xl block font-semibold">
                        Partner
                    </Link>
                    <Link href="#" className="text-primaryColor-50 text-xl block font-semibold">
                        Partner
                    </Link>
                </div>
                <div className="col-span-2">
                    <Link href="#" className="text-primaryColor-50 text-xl block font-semibold">
                        Services
                    </Link>
                    <Link href="#" className="text-primaryColor-50 text-xl block font-semibold">
                        Services
                    </Link>
                    <Link href="#" className="text-primaryColor-50 text-xl block font-semibold">
                        Services
                    </Link>
                </div>
                <div className="col-span-2">
                    <Link href="#" className="text-primaryColor-50 text-xl block font-semibold">
                        Contact
                    </Link>
                    <Link href="#" className="text-primaryColor-50 text-xl block font-semibold">
                        Contact
                    </Link>
                    <Link href="#" className="text-primaryColor-50 text-xl block font-semibold">
                        Contact
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Footer;
