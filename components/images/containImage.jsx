import React, { forwardRef } from "react";
import Image from "next/image";

const ContainImage = (
    { src, mobileSrc, alt, height, onClick, width, position, className, style, aspectRatio, onLoadingComplete },
    ref
) => {
    return (
        <div
            ref={ref}
            style={{
                position: position,
                ...style, // Merge the provided style prop
            }}
            className={className}
        >
            {/* Use mobileSrc prop for mobile devices, and src prop otherwise */}
            {mobileSrc && (
                <Image
                    src={mobileSrc}
                    alt={alt}
                    layout="fill"
                    objectFit="contain"
                    quality={100}
                    className="block lg:hidden"
                    onClick={onClick}
                    style={{ aspectRatio: aspectRatio }} // Apply the custom aspect ratio for mobile
                    onLoadingComplete={onLoadingComplete} // Pass the onLoad prop to the Image component
                />
            )}
            {src && (
                <Image
                    src={src}
                    alt={alt}
                    layout="fill"
                    objectFit="contain"
                    quality={100}
                    className="hidden lg:block"
                    onClick={onClick}
                    style={{ aspectRatio: aspectRatio }} // Apply the custom aspect ratio for desktop
                    onLoadingComplete={onLoadingComplete} // Pass the onLoad prop to the Image component
                />
            )}
        </div>
    );
};

export default forwardRef(ContainImage);
