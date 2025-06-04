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
import TShirtRueckevolleBreite from "@/assets/icons/TShirt-Ruecken-volle-Breite.svg";

import Hoodierechtsoben from "@/assets/icons/Hoodie-rechts-oben.svg";
import Hoodielinkssoben from "@/assets/icons/Hoodie-links-oben.svg";
import HoodiemitteOben from "@/assets/icons/Hoodie-Brust-mitte-oben.svg";

import HoodieRueckenrechtsoben from "@/assets/icons/Hoodie-Ruecken-rechts-oben.svg";
import HoodieRueckenlinkssoben from "@/assets/icons/Hoodie-Ruecken-links-oben.svg";
import HoodieRueckenmitteoben from "@/assets/icons/Hoodie-Ruecken-mitte-oben.svg";
import HoodieRueckenmitte from "@/assets/icons/Hoodie-Ruecken-mitte.svg";

import Jackerechtsoben from "@/assets/icons/Jacke-Brust-rechts-oben.svg";
import Jackelinkssoben from "@/assets/icons/Jacke-Brust-links-oben.svg";
import Jackemitte from "@/assets/icons/Jacke-Brust-mitte.svg";

import JackeRueckenrechtsoben from "@/assets/icons/Jacke-Ruecken-rechts-oben.svg";
import JackeRueckenlinkssoben from "@/assets/icons/Jacke-Ruecken-links-oben.svg";
import JackeRueckenmitteoben from "@/assets/icons/Jacke-Ruecken-mitte-oben.svg";
import JackeRueckenmitte from "@/assets/icons/Jacke-Ruecken-mitte.svg";

import HoseVorneRechts from "@/assets/icons/Hose-vorne-rechts.svg";
import HoseVorneLinks from "@/assets/icons/Hose-vorne-links.svg";
import HoseHintenLinks from "@/assets/icons/Hose-hinten-links.svg";
import HoseHintenRechts from "@/assets/icons/Hose-hinten-rechts.svg";

import PenLinks from "@/assets/icons/pen-left.svg";
import PenMitte from "@/assets/icons/pen-center.svg";
import PenRechts from "@/assets/icons/pen-right.svg";
import PenVoll from "@/assets/icons/pen-full.svg";

import ZollStockLinks from "@/assets/icons/Zollstock_links.svg";
import ZollStockMitte from "@/assets/icons/zollstock_mitte.svg";
import ZollStockRechts from "@/assets/icons/zollstock_rechts.svg";
import ZollStockVoll from "@/assets/icons/zollstock_voll.svg";

import Front from "@/assets/icons/Front.svg";

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
    const TShirtPositions = {
        "Brust rechts oben": TShirtrechtsoben,
        "Brust links oben": TShirlinkssoben,
        "Brust mitte oben": TShirtmitteoben,
        "Brust Mitte": TShirtmitte,
        "Rücken rechts oben": TShirtRueckenrechtsoben,
        "Rücken links oben": TShirtRueckenlinkssoben,
        "Rücken oben mitte": TShirtRueckenmitteoben,
        "Rücken volle Breite": TShirtRueckevolleBreite,
        "Rücken Mitte": TShirtRueckenmitte,
    };

    const SweaterPositions = {
        "Brust rechts oben": TShirtrechtsoben,
        "Brust links oben": TShirlinkssoben,
        "Brust mitte oben": TShirtmitteoben,
        "Brust Mitte": TShirtmitte,
        "Rücken rechts oben": TShirtRueckenrechtsoben,
        "Rücken links oben": TShirtRueckenlinkssoben,
        "Rücken oben mitte": TShirtRueckenmitteoben,
        "Rücken Mitte": TShirtRueckenmitte,
    };

    const PoloPositions = {
        "Brust rechts oben": TShirtrechtsoben,
        "Brust links oben": TShirlinkssoben,
        "Brust mitte oben": TShirtmitteoben,
        "Brust Mitte": TShirtmitte,
        "Rücken rechts oben": TShirtRueckenrechtsoben,
        "Rücken links oben": TShirtRueckenlinkssoben,
        "Rücken oben mitte": TShirtRueckenmitteoben,
        "Rücken Mitte": TShirtRueckenmitte,
    };

    const HoodiePositions = {
        "Brust rechts oben": Hoodierechtsoben,
        "Brust links oben": Hoodielinkssoben,
        "Brust mitte oben": HoodiemitteOben,
        "Rücken rechts oben": HoodieRueckenrechtsoben,
        "Rücken links oben": HoodieRueckenlinkssoben,
        "Rücken oben mitte": HoodieRueckenmitteoben,
        "Rücken Mitte": HoodieRueckenmitte,
    };

    const JackePositions = {
        "Brust rechts oben": Jackerechtsoben,
        "Brust links oben": Jackelinkssoben,
        "Brust mitte oben": Jackemitte,
        "Brust Mitte": Jackemitte,
        "Rücken rechts oben": JackeRueckenrechtsoben,
        "Rücken links oben": JackeRueckenlinkssoben,
        "Rücken oben mitte": JackeRueckenmitteoben,
        "Rücken Mitte": JackeRueckenmitte,
    };

    const HosePositions = {
        "Oberschenkel vorne links": HoseVorneLinks,
        "Oberschenkel vorne rechts": HoseVorneRechts,
        "Oberschenkel hinten links": HoseHintenLinks,
        "Oberschenkel hinten rechts": HoseHintenRechts,
    };

    const PenPositions = {
        "Kugelschreiber links": PenLinks,
        "Kugelschreiber mitte": PenMitte,
        "Kugelschreiber rechts": PenRechts,
        "Kugelschreiber voll": PenVoll,
    };

    const ZollStockPositions = {
        "Zollstock links": ZollStockLinks,
        "Zollstock mitte": ZollStockMitte,
        "Zollstock rechts": ZollStockRechts,
        "Zollstock voll": ZollStockVoll,
    };

    const ItemPositions = {
        Front: Front,
    };

    if (tags.includes("T-Shirt")) {
        return TShirtPositions[label] || "/images/default.png";
    } else if (tags.includes("Tshirt")) {
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
    } else if (tags.includes("hose")) {
        return HosePositions[label] || "/images/default.png";
    } else if (tags.includes("werbematerial")) {
        return ItemPositions[label] || "/images/default.png";
    } else if (tags.includes("Kugelschreiber")) {
        return PenPositions[label] || "/images/default.png";
    } else if (tags.includes("Zollstock")) {
        return ZollStockPositions[label] || "/images/default.png";
    }

    return TShirtPositions[label] || Front;
}

const CustomRadioButton = ({ id, name, label, icon, value, checked, onChange, product }) => {
    // We fetch the correct image for this label from our map
    // Determine which image to show based on product tags + label
    const imageSrc = getGraphicForProductType(product, label);

    // If you want dynamic styling for the card when it's selected vs. not selected
    const cardBorder = checked ? "border-primaryColor-500 bg-accentColor" : "border-gray-300 opacity-70";
    const textColor = checked ? "text-primaryColor-700 font-semibold" : "text-gray-700";

    // We handle clicks on the card container itself so users can click anywhere to select
    const handleCardClick = () => {
        onChange(value);
    };

    return (
        <div
            className={`
        flex flex-col items-center justify-center p-4 cursor-pointer 
        border rounded-md transition-shadow hover:shadow-md w-2/4 
        ${cardBorder}
      `}
            onClick={handleCardClick}
        >
            {/* Image (above the label) */}
            {/* Using Next.js <Image> as an example; if not using Next.js, replace with <img> */}
            <div className="w-12 h-12 lg:w-20 lg:h-20 mb-2 relative">
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
            <label
                htmlFor={id}
                className={`flex items-center justify-center text-sm lg:text-base gap-1 ${textColor} min-w-[80px] sm:min-w-[100px] md:min-w-[120px] text-center`}
            >
                {icon && <span className="w-5 h-5">{icon}</span>}
                <span className="truncate">{label}</span>
            </label>
        </div>
    );
};

export default CustomRadioButton;
