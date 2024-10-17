import React from "react";
import ArrowButtonBlack from "../../assets/ArrowBtnBlack.jsx";

const GeneralNavButton = ({ direction, onClick, dark, backgroundColor, arrowColor, width, height, klasse }) => {
    return (
        <div className={`rounded-xl p-1 lg:p-2 cursor-pointer ${klasse} ${dark ? "bg-dark" : ""}`} onClick={onClick}>
            <div className={direction === "left" ? "rotate-180" : null}>
                <ArrowButtonBlack
                    backgroundColor={backgroundColor}
                    arrowColor={arrowColor}
                    width={width}
                    height={height}
                />
            </div>
        </div>
    );
};

export default GeneralNavButton;
