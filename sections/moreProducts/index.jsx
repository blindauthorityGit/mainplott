import React from "react";
import Link from "next/link";

export default function MoreProducts({ relatedProducts }) {
    if (!relatedProducts || relatedProducts.length === 0) {
        return null; // No products to display
    }

    return (
        <div className="mt-16 font-body">
            <h2 className="text-2xl font-bold mb-6">Mehr aus dieser Kategorie</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                    <Link key={product.id} href={`/products/${product.handle}`}>
                        <div className="border p-4 rounded-lg shadow hover:shadow-lg transition">
                            <div className="relative h-48 overflow-hidden rounded">
                                {product.images.edges.length > 0 && (
                                    <img
                                        src={product.images.edges[0].node.originalSrc}
                                        alt={product.images.edges[0].node.altText || product.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-800">{product.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
