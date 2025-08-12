import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function MoreProducts({ relatedProducts, currentProductHandle }) {
    const [visibleCount, setVisibleCount] = useState(12); // Initially show 8 products
    if (!relatedProducts || relatedProducts.length === 0) {
        return null;
    }

    // Filter out the current product
    const filteredProducts = relatedProducts.filter(
        (product) => product.title !== currentProductHandle.productByHandle.title
    );

    if (filteredProducts.length === 0) {
        return null;
    }

    const handleShowMore = () => {
        setVisibleCount((prevCount) => prevCount + 8); // Show 8 more products on click
    };

    return (
        <div className="mt-16 font-body px-4 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-textColor lg:text-left">
                Mehr aus dieser Kategorie
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <AnimatePresence>
                    {filteredProducts.slice(0, visibleCount).map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition overflow-hidden"
                        >
                            <Link href={`/products/${product.handle}`}>
                                {/* Image Container with uniform aspect ratio */}
                                <div className="relative aspect-square bg-gray-50 cursor-pointer">
                                    {product.images.edges.length > 0 && (
                                        <img
                                            src={product.images.edges[0].node.originalSrc}
                                            alt={product.images.edges[0].node.altText || product.title}
                                            className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-300 transform hover:scale-105"
                                        />
                                    )}
                                </div>
                                {/* Product Title */}
                                <h3 className="mt-2 mb-4 text-sm 2xl:text-base font-semibold text-center text-gray-700 px-2">
                                    {product.title}
                                </h3>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Show More Button */}
            {filteredProducts.length > visibleCount && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleShowMore}
                        className="px-6 py-2 font-semibold underline  text-textColor rounded-md hover:bg-primaryColor-700 transition"
                    >
                        Mehr anzeigen
                    </button>
                </div>
            )}
        </div>
    );
}
