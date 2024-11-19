import React from "react";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi"; // Contact icons
import { CoverImage } from "@/components/images"; // Custom CoverImage component
import urlFor from "@/functions/urlFor"; // Sanity image helper
import { H2, P } from "@/components/typography"; // Custom typography components
import client from "../../client"; // Import the Sanity client

const ContactPage = ({ data }) => {
    return (
        <div className="container mx-auto grid grid-cols-12 gap-8 py-36 px-28">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-6 space-y-8 pr-16">
                <H2 klasse="text-primaryColor">Kontakt</H2>
                <div className="space-y-4">
                    <P klasse="text-blackColor">
                        Wir freuen uns, von Ihnen zu hören! Egal ob Fragen, Anregungen oder Wünsche – unser Team steht
                        Ihnen gerne zur Verfügung.
                    </P>
                    <P klasse="text-blackColor">
                        Sie können uns jederzeit per E-Mail, Telefon oder über unser Kontaktformular erreichen. Wir
                        bemühen uns, Ihnen so schnell wie möglich zu antworten.
                    </P>
                </div>
                {/* Contact Info */}
                <div className="space-y-4">
                    <div className="flex items-center">
                        <FiMail className="text-primaryColor text-2xl mr-3" />
                        <span className="text-lg text-blackColor">office@mainplott.de</span>
                    </div>
                    <div className="flex items-center">
                        <FiPhone className="text-primaryColor text-2xl mr-3" />
                        <span className="text-lg text-blackColor">+43 123 456 789</span>
                    </div>
                    <div className="flex items-center">
                        <FiMapPin className="text-primaryColor text-2xl mr-3" />
                        <span className="text-lg text-blackColor">Neue Straße 528, 28232 Musterstadt</span>
                    </div>
                </div>
            </div>
            {/* Right Column */}
            <div className="col-span-12 lg:col-span-6">
                <div className="relative w-full h-64 lg:h-full rounded-md overflow-hidden shadow-lg">
                    <CoverImage
                        src={urlFor(data.heroImage).url()}
                        alt="Kontakt Cover"
                        klasse="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default ContactPage;

// Server-side data fetching function
export async function getServerSideProps() {
    // Fetch data from Sanity
    const query = `*[_type == "aboutPage"][0]`; // Adjust your query as needed
    const data = await client.fetch(query);

    // Return the fetched data as props
    return {
        props: {
            data,
        },
    };
}
