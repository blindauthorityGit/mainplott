import React from "react";
import Link from "next/link";

// import Arrow from "../../assets/icons/arrowBlack.svg";
const TextButton = ({ link, centered, noMargin, children }) => {
    return (
        <Link href={link} className={centered ? "mx-auto left-0 right-0  relative" : null}>
            <button className={`max-w-[24rem] font-bold  text-textColor ${noMargin ? null : "mt-4 lg:mt-8 md:mt-8"}`}>
                <div className="flex">
                    {" "}
                    {/* <img className="mr-2 font-body" src={Arrow.src} alt="" /> {children} */}
                </div>
            </button>
        </Link>
    );
};
export default TextButton;
