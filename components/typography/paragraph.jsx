// components/Typography.js
import React from "react";

const P = ({ children, klasse, style, htmlContent, isHtml = false, ...props }) => {
    const createMarkup = (htmlString) => {
        return { __html: htmlString };
    };

    return (
        <p
            style={style}
            className={`text-sm tracking-widest text-darkGrey sm:text-base md:text-lg font-body  xl:leading-relaxed lg:text-base xl:text-sm 2xl:text-base 3xl:text-[1rem] 3xl:leading-7  ${klasse}`}
            {...props} // Spread additional props here
        >
            {isHtml ? <span dangerouslySetInnerHTML={createMarkup(htmlContent)} /> : htmlContent}
            {children}
        </p>
    );
};

// Add more headline components for H3, H4, etc.

export { P };
