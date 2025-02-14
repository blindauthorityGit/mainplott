import React from "react";
import { FiMail, FiPhone, FiMapPin, FiMessageSquare, FiSmartphone } from "react-icons/fi";
import { CoverImage } from "@/components/images"; // Custom CoverImage component, optional
import urlFor from "@/functions/urlFor"; // Sanity image helper, optional
import { H2, P } from "@/components/typography"; // Custom typography components
import client from "../../client"; // Sanity client for data fetching
import { BasicPortableText } from "@/components/content";

/**
 * Contact Page
 * Showcases your contact info in a modern, two-column layout.
 * - Left: Contact text and details
 * - Right: Optional cover image from Sanity (if present)
 */

const ContactPage = ({ data }) => {
    console.log(data);
    return (
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 py-12 px-6 lg:px-12 font-body">
            {/* Left Column: Contact Details */}
            <div className="space-y-8 flex flex-col justify-center">
                <H2 klasse="text-primaryColor mb-4">Kontakt</H2>

                <div className="space-y-4">
                    <BasicPortableText value={data.content}></BasicPortableText>
                </div>

                {/* Contact Info */}
                <div className="mt-6 space-y-5">
                    {/* Company Name & Address */}
                    <div className="flex items-start space-x-3">
                        <FiMapPin className="text-primaryColor text-2xl mt-1" />
                        <div>
                            <p className="text-blackColor font-semibold">Gack &amp; Konhäuser GbR</p>
                            <p className="text-blackColor">MAINPLOTT</p>
                            <p className="text-blackColor">Schießbergstr. 4</p>
                            <p className="text-blackColor">63303 Dreieich</p>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center space-x-3">
                        <FiMail className="text-primaryColor text-xl" />
                        <a href={`mailto:${data.email}`} className="text-lg text-blackColor hover:underline">
                            {data.email}
                        </a>
                    </div>

                    {/* WhatsApp Business */}
                    <div className="flex items-center space-x-3">
                        <FiMessageSquare className="text-primaryColor text-xl" />
                        <a
                            href={`https://wa.me/${data.whatsapp.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg text-blackColor hover:underline"
                        >
                            WhatsApp: {data.whatsapp}
                        </a>
                    </div>

                    {/* Mobile */}
                    <div className="flex items-center space-x-3">
                        <FiSmartphone className="text-primaryColor text-xl" />
                        <a
                            href={`tel:+${data.phone.replace(/[^0-9]/g, "")}`}
                            className="text-lg text-blackColor hover:underline"
                        >
                            Mobil: {data.phone}
                        </a>
                    </div>
                </div>
            </div>

            {/* Right Column: Optional Cover Image */}
            <div className="mt-6 lg:mt-0 flex items-center justify-center">
                {data?.image ? (
                    <div className="w-full h-64 lg:h-[30rem] relative rounded-md overflow-hidden shadow-lg">
                        <CoverImage
                            src={urlFor(data.image).url()}
                            alt="Kontakt Cover"
                            klasse="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    // Fallback if there's no heroImage in data
                    <div className="w-full h-64 lg:h-[30rem] bg-gray-200 flex items-center justify-center text-gray-500 rounded-md">
                        <p>Kein Titelbild vorhanden</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactPage;

// Server-side data fetching function
export async function getServerSideProps() {
    // Example: fetch data from a "contactPage" or "aboutPage" document
    const query = `*[_type == "kontaktPage"][0]`;
    // Adjust your query as needed.
    // If you have a different doc type or field for the hero image, update accordingly.

    const data = await client.fetch(query);

    // Return the fetched data as props
    return {
        props: {
            data,
        },
    };
}
