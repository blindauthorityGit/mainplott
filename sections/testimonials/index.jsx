import React, { useEffect } from "react";

import InfoBox from "../../components/infoBox/infoBox";

import { FaTshirt, FaGift } from "react-icons/fa"; // Importing icons for shirt and present
import { AiFillPrinter } from "react-icons/ai"; // Importing icon for printer
import { MdOutlineDesignServices } from "react-icons/md"; // Importing icon for vector graphics

const TestimonialsSection = ({ data }) => {
    useEffect(() => {
        console.log(data);
    }, [data]);

    return (
        <div className="grid grid-cols-12 lg:px-24 lg:gap-12 lg:mt-10">
            {data.map((e, i) => {
                return <InfoBox klasse="lg:col-span-4 items-start" text={e.text} key={`linkbox${i}`} />;
            })}
        </div>
    );
};

export default TestimonialsSection;
