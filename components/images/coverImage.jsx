import React, { forwardRef, useState } from "react";
import Image from "next/image";
import BeatLoader from "react-spinners/BeatLoader";

const CoverImage = (
    {
        src,
        mobileSrc,
        alt,
        height,
        klasse,
        onClick,
        priority,
        width,
        position,
        className,
        style,
        aspectRatio,
        mobileFit = "cover", // Defaults to "cover" if not provided
        desktopFit = "cover", // Defaults to "cover" if not provided
    },
    ref
) => {
    const [isLoading, setLoading] = useState(true);

    const handleLoad = () => {
        setLoading(false);
    };

    // Style object for the loader container
    const loaderContainerStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%", // Ensure parent container has height
        position: "absolute", // Position it over the image
        width: "100%", // Take full width of the parent
        top: 0,
        left: 0,
        zIndex: 10, // Higher z-index to show above the image
    };

    return (
        <div
            ref={ref}
            style={{
                position: position,
                ...style,
            }}
            className={className}
        >
            {/* Spinner Container */}
            {isLoading && (
                <div style={loaderContainerStyle}>
                    <BeatLoader size={10} color="#55476B" />
                </div>
            )}

            {/* Mobile Image */}
            {mobileSrc && (
                <Image
                    src={mobileSrc}
                    alt={alt}
                    fill
                    sizes="100%"
                    quality={80}
                    priority={priority}
                    className={`block lg:hidden ${klasse}`}
                    onClick={onClick}
                    style={{ aspectRatio: aspectRatio, objectFit: mobileFit }}
                    onLoad={handleLoad}
                />
            )}

            {/* Desktop Image */}
            {src && (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={priority}
                    sizes="100%"
                    quality={80}
                    className={`hidden lg:block ${klasse}`}
                    onClick={onClick}
                    style={{ aspectRatio: aspectRatio, objectFit: desktopFit }}
                    onLoad={handleLoad}
                />
            )}
        </div>
    );
};

export default forwardRef(CoverImage);
