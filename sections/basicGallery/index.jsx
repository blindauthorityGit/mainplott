import React from "react";
import { CoverImage } from "@/components/images";
import urlFor from "@/functions/urlFor";

const BasicGallery = ({ data }) => {
    if (!data || data.length === 0) return null; // Handle empty or undefined images array

    return (
        <div className="w-full grid grid-cols-12 gap-4  p-4">
            {data.map((image, index) => (
                <div key={index} className="col-span-6 md:col-span-4 lg:col-span-4 relative">
                    <CoverImage
                        src={urlFor(image).url()}
                        mobileSrc={urlFor(image).url()}
                        alt={`Gallery Image ${index + 1}`}
                        klasse=""
                        className="aspect-square rounded-md shadow-md"
                    />
                </div>
            ))}
        </div>
    );
};

export default BasicGallery;
