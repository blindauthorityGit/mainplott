import { useState } from "react";
import { CoverImage } from "../images";
import Link from "next/link";
import { getColorHex } from "@/libs/colors";
import formatVariants from "@/functions/formatVariants";
import { motion } from "framer-motion";
import calculateLowestPrice from "@/functions/calculateLowestPrice";
import useUserStore from "@/store/userStore";

function ProductCard({ product }) {
    const handle = product.node.handle;
    const title = product.node.title;
    const description = product.node.description || "";

    const mainCategoryTag = product.node.tags.find((t) => t.startsWith("category_"))?.replace("category_", "");
    const subCategoryTag = product.node.tags.find((t) => t.startsWith("subCategory_"))?.replace("subCategory_", "");
    const imageNode = product.node?.images?.edges?.[0]?.node;

    const formattedVariants = formatVariants(product.node.variants);
    const user = useUserStore((s) => s.user);

    const specialCollectionKeywords = ["kinder", "hochzeit", "geburt", "weihnachten", "geschenkidee"];
    const collections = product.node.collections?.edges || [];
    const isSpecialCollection = collections.some((e) =>
        specialCollectionKeywords.some((kw) => e.node.handle.includes(kw))
    );

    const firstOptionKey = Object.keys(formattedVariants)[0];
    const colors = formattedVariants[firstOptionKey]?.colors || [];

    // 👉 Bild-Loading-Status für Skeleton & Fade-in
    const [imgLoaded, setImgLoaded] = useState(true);

    return (
        <motion.div
            initial={{ y: 8 }} // keine Opacity-Animation mehr
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }} // früh triggern
            whileHover={{ y: -4 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="group relative w-full h-full rounded-2xl font-body border border-gray-200 bg-white shadow-sm hover:shadow-md/70 hover:border-gray-300 transition-all will-change-transform"
            style={{
                contentVisibility: "auto", // Paint sparen, vermeidet Jank beim Scrollen
                containIntrinsicSize: "320px 380px",
            }}
        >
            {/* Badges */}
            <div className="absolute top-2 right-2 z-10 flex gap-1.5 pointer-events-none">
                {mainCategoryTag && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/85 backdrop-blur border border-gray-200 text-textColor">
                        {mainCategoryTag}
                    </span>
                )}
                {subCategoryTag && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] bg-primaryColor/90 text-white">
                        {subCategoryTag}
                    </span>
                )}
            </div>

            {/* Bild */}
            <Link
                href={`/products/${handle}`}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryColor/40 rounded-t-2xl"
            >
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="relative h-48 lg:h-52 2xl:h-64 overflow-hidden rounded-t-2xl bg-gray-50"
                >
                    {/* Skeleton-Placeholder (verschwindet beim onLoad) */}
                    <div
                        className={`absolute inset-0 transition-opacity duration-300 ${
                            imgLoaded ? "opacity-0" : "opacity-100"
                        }`}
                    >
                        <div className="h-full w-full animate-pulse bg-gradient-to-br from-gray-100 to-gray-200" />
                    </div>

                    <CoverImage
                        src={imageNode?.originalSrc}
                        mobileSrc={imageNode?.originalSrc}
                        alt={title}
                        // wichtig: nur das Bild faded ein, nicht die ganze Card
                        klasse={`absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-300 group-hover:scale-[1.06] ${
                            imgLoaded ? "opacity-100" : "opacity-0"
                        } transition-opacity duration-300`}
                        onLoad={() => setImgLoaded(true)}
                        loading="lazy"
                        decoding="async"
                    />

                    {/* dezente Bottom-Fade */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3">
                <div>
                    <h3 className="font-body text-base lg:text-md 2xl:text-lg font-semibold text-textColor leading-snug line-clamp-2">
                        {title}
                    </h3>
                    <p className="mt-1 text-xs lg:text-xs 2xl:text-sm text-textColor/80 line-clamp-2">{description}</p>
                </div>

                <div className="mt-1 flex flex-col gap-3">
                    {/* Farben / Varianten */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {isSpecialCollection ? (
                            <span className="text-xs text-textColor">
                                in {product.node.variants.edges.length} Variationen
                            </span>
                        ) : (
                            <>
                                {colors.slice(0, 4).map(({ color }, i) => (
                                    <span
                                        key={`color-${i}`}
                                        className="inline-block w-4 h-4 lg:w-5 lg:h-5 rounded-full ring-1 ring-gray-300"
                                        style={{ background: getColorHex(color) }}
                                        aria-label={color}
                                        title={color}
                                    />
                                ))}
                                {colors.length > 4 && (
                                    <span className="text-[11px] text-textColor/70">
                                        + {colors.length - 4} weitere Farben
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {/* Preis */}
                    <div className="flex items-baseline justify-between">
                        <div className="font-primary font-semibold text-base 2xl:text-lg text-gray-700">
                            {calculateLowestPrice(product.node.variants.edges)}
                        </div>
                        <div className="text-[11px] text-textColor/70">
                            {user?.userType === "firmenkunde" ? "ohne MwSt." : "inkl. MwSt."}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default ProductCard;
