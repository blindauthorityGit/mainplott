import React, { useEffect } from "react";

import LinkBox from "../../components/linkBox/linkBox";

import { FaTshirt, FaGift } from "react-icons/fa"; // Importing icons for shirt and present
import { AiFillPrinter } from "react-icons/ai"; // Importing icon for printer
import { MdOutlineDesignServices } from "react-icons/md"; // Importing icon for vector graphics

const LinkBoxesSection = ({ data, klasse }) => {
    useEffect(() => {
        console.log(data);
    }, [data]);

    const icons = [FaTshirt, AiFillPrinter, FaGift, MdOutlineDesignServices];

    return (
        <div className={`grid grid-cols-12  lg:px-24 gap-2 lg:gap-6 mt-4 lg:mt-10 `}>
            {data?.map((e, i) => {
                return (
                    <LinkBox
                        klasse={`lg:col-span-3 col-span-6 items-start ${klasse}`}
                        image={e.image}
                        link={e.link}
                        text={e.text}
                        details={e.details}
                        title={e.title}
                        icon={e.icon} // Assigning the icons cyclically to each LinkBox
                        key={`linkbox${i}`}
                    />
                );
            })}
        </div>
    );
};

export default LinkBoxesSection;
