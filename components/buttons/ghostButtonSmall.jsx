import React from "react";
import Link from "next/link";
const GhostButtonSmall = (props) => {
    return (
        <Link href={props.link} className={`w-full`}>
            <button
                onClick={props.onClick}
                className={`max-w-[24rem] border border-primaryColor-100 hover:border-primaryColor-200 hover:bg-primaryColor-200 hover:text-blackText-950 transition-all duration-200 col-span-12  hover-underline-animation z-20 flex items-center justify-center text-primaryColor-100 font-sans tracking-wider py-3 text-base sm:text-base sm:py-3 px-6 w-full min-w-[10rem] w-full uppercase rounded-md `}
            >
                <span className=""> {props.children}</span>
            </button>
        </Link>
    );
};
export default GhostButtonSmall;
