import React from "react";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa"; // Importing quote icons from FontAwesome
import { BasicPortableText } from "../content"; // Make sure this is exported correctly from the file.

const InfoBox = ({ text, klasse = "", backgroundColor = "bg-accentColor" }) => {
    return (
        <div
            className={`relative border-2 border-textColor rounded-[20px] w-[95%] lg:w-full p-8 text-center ${klasse}`}
        >
            {/* Background div extending horizontally and vertically centered */}
            <div
                className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[105%] h-[88%] ${backgroundColor} -z-10 rounded-[20px]`}
            ></div>

            {/* Top-left quote icon */}
            <div className="absolute -top-6 left-10 bg-white rounded-full p-1">
                <FaQuoteLeft className="text-primaryColor text-3xl" />
            </div>

            {/* Bottom-right quote icon */}
            <div className="absolute -bottom-6 right-10 bg-white rounded-full p-1">
                <FaQuoteRight className="text-primaryColor text-3xl" />
            </div>

            {/* Centered text */}
            {text && <BasicPortableText value={text} />}
        </div>
    );
};

export default InfoBox;
