import React from "react";
import Link from "next/link";

export default function MoreProducts({ relatedProducts, currentProductHandle }) {
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

    return (
        <div className="mt-16 font-body px-4 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center lg:text-left">Mehr aus dieser Kategorie</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <Link key={product.id} href={`/products/${product.handle}`}>
                        <div className="group bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
                            {/* Image Container with uniform aspect ratio */}
                            <div className="relative aspect-square bg-gray-50">
                                {product.images.edges.length > 0 && (
                                    <img
                                        src={product.images.edges[0].node.originalSrc}
                                        alt={product.images.edges[0].node.altText || product.title}
                                        className="absolute inset-0 w-full h-full object-contain p-2"
                                    />
                                )}
                            </div>
                            {/* Product title */}
                            <h3 className="mt-2 mb-4 text-sm lg:text-base font-medium text-center text-gray-700 px-2">
                                {product.title}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
