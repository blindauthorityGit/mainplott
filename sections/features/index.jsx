import React, { useEffect } from "react";

import IconBox from "../../components/iconBox/iconBox";

import { FaTshirt, FaGift } from "react-icons/fa"; // Importing icons for shirt and present
import { AiFillPrinter } from "react-icons/ai"; // Importing icon for printer
import { MdOutlineDesignServices } from "react-icons/md"; // Importing icon for vector graphics

const FeaturesSection = ({ data }) => {
    useEffect(() => {}, [data]);

    return (
        <div className="grid grid-cols-12 lg:px-24 lg:gap-6 lg:mt-10">
            {data.map((e, i) => {
                return (
                    <IconBox
                        klasse="lg:col-span-3 col-span-12 items-start"
                        icon={e.image}
                        headline={e.headline}
                        text={e.text}
                        key={`iconbox${i}`}
                    />
                );
            })}
        </div>
    );
};

export default FeaturesSection;
