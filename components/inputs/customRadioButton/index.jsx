import React from "react";
import Image from "next/image"; // If you're using Next.js and want optimized images
// If not using Next.js, you can use a standard <img src={imageSrc} />

import TShirtrechtsoben from "@/assets/icons/TShirt-links-oben.svg";
import TShirtmitteoben from "@/assets/icons/TShirt-mitte-oben.svg";
import TShirlinkssoben from "@/assets/icons/TShirt-rechts-oben.svg";
import TShirtmitte from "@/assets/icons/TShirt-mitte.svg";

import TShirtRueckenrechtsoben from "@/assets/icons/TShirt-Ruecken-rechts-oben.svg";
import TShirtRueckenmitteoben from "@/assets/icons/TShirt-Ruecken-Mitte-oben.svg";
import TShirtRueckenlinkssoben from "@/assets/icons/TShirt-Ruecken-links-oben.svg";
import TShirtRueckenmitte from "@/assets/icons/TShirt-Ruecken-Mitte.svg";

import Hoodierechtsoben from "@/assets/icons/Hoodie-rechts-oben.svg";
import Hoodielinkssoben from "@/assets/icons/Hoodie-links-oben.svg";

import HoodieRueckenrechtsoben from "@/assets/icons/Hoodie-Ruecken-rechts-oben.svg";
import HoodieRueckenlinkssoben from "@/assets/icons/Hoodie-Ruecken-links-oben.svg";
import HoodieRueckenmitteoben from "@/assets/icons/Hoodie-Ruecken-mitte-oben.svg";
import HoodieRueckenmitte from "@/assets/icons/Hoodie-Ruecken-mitte.svg";

// Example label-to-image map
const labelImages = {
    "Label One": "/images/label1.png",
    "Label Two": "/images/label2.png",
    "Label Three": "/images/label3.png",
    // ... add more as needed
};

// 1) Helper function
function getGraphicForProductType(product, label) {
    const tags = product?.productByHandle?.tags || product?.tags || [];
    console.log(tags);

    const TShirtPositions = {
        "Brust rechts oben": TShirtrechtsoben,
        "Brust links oben": TShirlinkssoben,
        "Brust mitte oben": TShirtmitteoben,
        "Brust Mitte": TShirtmitte,
        "Rücken rechts oben": TShirtRueckenrechtsoben,
        "Rücken links oben": TShirtRueckenlinkssoben,
        "Rücken oben mitte": TShirtRueckenmitteoben,
        "Rücken Mitte": TShirtRueckenmitte,
    };

    // const SweaterPositions = {
    //     "Rechts oben": SweaterRechtsOben,
    // };

    // const PoloPositions = {
    //     "Rechts oben": PoloRechtsOben,
    // };

    const HoodiePositions = {
        "Brust rechts oben": Hoodierechtsoben,
        "Brust links oben": Hoodielinkssoben,
        "Rücken rechts oben": HoodieRueckenrechtsoben,
        "Rücken links oben": HoodieRueckenlinkssoben,
        "Rücken oben mitte": HoodieRueckenmitteoben,
        "Rücken Mitte": HoodieRueckenmitte,
    };

    // const JackePositions = {
    //     "Rechts oben": JackeRechtsOben,
    // };

    // const HosePositions = {
    //     "Rechts oben": HoseRechtsOben,
    // };

    if (tags.includes("T-Shirt")) {
        return TShirtPositions[label] || "/images/default.png";
    } else if (tags.includes("Sweater")) {
        return SweaterPositions[label] || "/images/default.png";
    } else if (tags.includes("Polo")) {
        return PoloPositions[label] || "/images/default.png";
    } else if (tags.includes("Hoodie")) {
        return HoodiePositions[label] || "/images/default.png";
    } else if (tags.includes("Hoodies")) {
        return HoodiePositions[label] || "/images/default.png";
    } else if (tags.includes("Jacke")) {
        return JackePositions[label] || "/images/default.png";
    } else if (tags.includes("Hose")) {
        return HosePositions[label] || "/images/default.png";
    }

    return "/images/default.png";
}

const CustomRadioButton = ({ id, name, label, icon, value, checked, onChange, product }) => {
    // We fetch the correct image for this label from our map
    // Determine which image to show based on product tags + label
    const imageSrc = getGraphicForProductType(product, label);

    // If you want dynamic styling for the card when it's selected vs. not selected
    const cardBorder = checked ? "border-primaryColor-500" : "border-gray-300 opacity-70";
    const textColor = checked ? "text-primaryColor-700 font-semibold" : "text-gray-700";

    // We handle clicks on the card container itself so users can click anywhere to select
    const handleCardClick = () => {
        onChange(value);
    };

    console.log(product);

    return (
        <div
            className={`
        flex flex-col items-center justify-center p-4 cursor-pointer 
        border rounded-md transition-shadow hover:shadow-md
        ${cardBorder}
      `}
            onClick={handleCardClick}
        >
            {/* Image (above the label) */}
            {/* Using Next.js <Image> as an example; if not using Next.js, replace with <img> */}
            <div className="w-20 h-20 mb-2 relative">
                <Image src={imageSrc} alt={label} layout="fill" objectFit="contain" />
            </div>

            {/* Hidden radio input (for accessibility) */}
            <input
                type="radio"
                id={id}
                name={name}
                value={value}
                checked={checked}
                onChange={(e) => onChange(e.target.value)}
                className="hidden"
            />

            {/* Label + optional icon */}
            <label htmlFor={id} className={`flex items-center gap-1 ${textColor}`}>
                {icon && <span className="w-5 h-5">{icon}</span>}
                {label}
            </label>
        </div>
    );
};

export default CustomRadioButton;
