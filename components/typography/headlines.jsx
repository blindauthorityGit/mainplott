import React from "react";

const H1 = React.forwardRef(({ children, klasse, style }, ref) => {
    return (
        <h1
            ref={ref}
            style={style}
            className={`text-[clamp(32px,calc(64px+0.0957*(100vw-320px)),56px)] uppercase  !leading-[0.95] 3xl:tracking-tight text-balance md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-[6.75rem] 4xl:text-[8.5rem] mb-4 lg:mb-6  font-headline text-darkGrey ${klasse}`}
        >
            {children}
        </h1>
    );
});
H1.displayName = "H1";

const H2 = React.forwardRef(({ children, klasse }, ref) => {
    return (
        <h2
            ref={ref}
            className={`text-4xl  font-headline text-darkGrey md:text-3xl   lg:text-2xl xl:text-4xl 2xl:text-7xl mb-4 lg:mb-10   ${klasse}`}
        >
            {children}
        </h2>
    );
});
H2.displayName = "H2";

const H3 = React.forwardRef(({ children, klasse, style }, ref) => {
    return (
        <h3 ref={ref} className={`text-base font-headline  xl:text-xl 2xl:text-5xl 2xl:mb-8   ${klasse}`} style={style}>
            {children}
        </h3>
    );
});
H3.displayName = "H3";

const H4 = React.forwardRef(({ children, klasse }, ref) => {
    return (
        <h4
            ref={ref}
            className={`text-base md:text-sm lg:text-lg xl:text-sm 2xl:text-xl font-black font-body mb-6 text-darkGrey ${klasse}`}
        >
            {children}
        </h4>
    );
});
H4.displayName = "H4";

const H5 = React.forwardRef(({ children, klasse }, ref) => {
    return (
        <h5 ref={ref} className={`text-xs lg:text-base xl:text-base font-bold font-body text-textColor ${klasse}`}>
            {children}
        </h5>
    );
});
H5.displayName = "H5";

export { H1, H2, H3, H4, H5 };
