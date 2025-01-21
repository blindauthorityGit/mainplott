import React, { useState } from "react";

const SimpleGallery = ({ images = [], selectedImage, onSelectImage }) => {
    // const [selectedImage, setSelectedImage] = useState(images[0] || ""); // Initialize with the first image

    if (images.length === 0) return <p>No images available</p>; // Handle case where no images are provided

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Main Image */}
            <div className="flex justify-center items-center   rounded-lg overflow-hidden w-full aspect-square lg:aspect-[square] max-w-2xl">
                <img src={selectedImage} alt="Selected" className="object-cover w-full h-full" />
            </div>

            {/* Thumbnails */}
            <div className="flex space-x-4 overflow-x-auto">
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectImage(image)}
                        className={`border rounded-lg overflow-hidden w-16 h-16 lg:w-20 lg:h-20 focus:outline-none ${
                            selectedImage === image ? "border-blue-500" : "border-gray-300"
                        }`}
                    >
                        <img src={image} alt={`Thumbnail ${index + 1}`} className="object-cover w-full h-full" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SimpleGallery;
