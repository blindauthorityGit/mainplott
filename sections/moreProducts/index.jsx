// components/shop/MoreProducts.js
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import formatVariants from "@/functions/formatVariants";
import calculateLowestPrice from "@/functions/calculateLowestPrice";
import { getColorHex } from "@/libs/colors";
import useUserStore from "@/store/userStore";

export default function MoreProducts({ relatedProducts, currentProductHandle }) {
    const [visibleCount, setVisibleCount] = useState(12);
    if (!relatedProducts || relatedProducts.length === 0) return null;

    // robustes Filtering des aktuellen Produkts
    const currentHandle =
        currentProductHandle?.productByHandle?.handle || currentProductHandle?.handle || currentProductHandle;

    const products = relatedProducts.filter((p) => p.handle !== currentHandle);
    if (products.length === 0) return null;

    const handleShowMore = () => setVisibleCount((n) => n + 8);

    return (
        <section className="mt-16 font-body px-4 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-textColor text-center lg:text-left">
                Mehr aus dieser Kategorie
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <AnimatePresence>
                    {products.slice(0, visibleCount).map((product, idx) => (
                        <MoreProductCard key={product.id} product={product} index={idx} />
                    ))}
                </AnimatePresence>
            </div>

            {products.length > visibleCount && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleShowMore}
                        className="px-5 py-2 rounded-full border border-gray-300 text-textColor text-sm hover:border-gray-400 hover:bg-gray-50 transition"
                    >
                        Mehr anzeigen
                    </button>
                </div>
            )}
        </section>
    );
}

function MoreProductCard({ product, index }) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const user = useUserStore((s) => s.user);

    // Tags (dezent als Badges)
    const mainTag = product.tags?.find((t) => t.startsWith("category_"))?.replace("category_", "");
    const subTag = product.tags?.find((t) => t.startsWith("subCategory_"))?.replace("subCategory_", "");

    // Varianten/Farben
    const formatted = useMemo(() => formatVariants(product), [product]);
    const firstKey = Object.keys(formatted)[0];
    const colors = formatted[firstKey]?.colors || [];

    // Preis (niedrigste Variante)
    const priceText = useMemo(() => calculateLowestPrice(product.variants?.edges || []), [product.variants]);

    const image = product.images?.edges?.[0]?.node;

    return (
        <motion.div
            initial={{ y: 8, opacity: 1 }} // keine Opacity-Fades, um Flicker zu vermeiden
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.16, ease: "easeOut", delay: index * 0.02 }}
            className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md/70 hover:border-gray-300 transition-all"
            style={{ contentVisibility: "auto", containIntrinsicSize: "220px 280px" }}
        >
            {/* Badges */}
            <div className="absolute top-2 right-2 z-10 flex gap-1.5 pointer-events-none">
                {mainTag && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/85 backdrop-blur border border-gray-200 text-textColor">
                        {mainTag}
                    </span>
                )}
                {subTag && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-primaryColor/90 text-white">{subTag}</span>
                )}
            </div>

            <Link
                href={`/products/${product.handle}`}
                className="block rounded-t-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryColor/40"
            >
                <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-50">
                    {/* Skeleton */}
                    <div
                        className={`absolute inset-0 transition-opacity duration-300 ${
                            imgLoaded ? "opacity-0" : "opacity-100"
                        }`}
                    >
                        <div className="h-full w-full animate-pulse bg-gradient-to-br from-gray-100 to-gray-200" />
                    </div>
                    {image && (
                        <img
                            src={image.originalSrc}
                            alt={image.altText || product.title}
                            onLoad={() => setImgLoaded(true)}
                            loading="lazy"
                            decoding="async"
                            className={`absolute inset-0 w-full h-full object-cover transform-gpu transition duration-300 ${
                                imgLoaded ? "opacity-100" : "opacity-0"
                            } group-hover:scale-[1.04]`}
                        />
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-3">
                    <h3 className="text-sm 2xl:text-base font-semibold text-textColor leading-snug line-clamp-2">
                        {product.title}
                    </h3>

                    {/* Farben (max 3) */}
                    <div className="mt-2 flex items-center gap-1.5">
                        {colors.slice(0, 3).map(({ color }, i) => (
                            <span
                                key={`${product.id}-c-${i}`}
                                className="inline-block w-4 h-4 rounded-full ring-1 ring-gray-300"
                                style={{ background: getColorHex(color) }}
                                title={color}
                            />
                        ))}
                        {colors.length > 3 && (
                            <span className="text-[11px] text-textColor/70">+{colors.length - 3}</span>
                        )}
                    </div>

                    {/* Preis */}
                    <div className="mt-2 flex items-baseline justify-between">
                        <div className="font-primary font-semibold text-sm 2xl:text-base text-gray-700">
                            {priceText}
                        </div>
                        <div className="text-[10px] text-textColor/60">
                            {user?.userType === "firmenkunde" ? "ohne MwSt." : "inkl. MwSt."}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
