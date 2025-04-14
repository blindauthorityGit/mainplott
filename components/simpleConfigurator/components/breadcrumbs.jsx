// components/Breadcrumbs.js
import Link from "next/link";
import { HiChevronRight } from "react-icons/hi"; // or any icon you'd like
import { motion } from "framer-motion";

export default function Breadcrumbs({ category, productTitle }) {
    return (
        <nav className="flex items-center text-xs p-2 lg:p-0 text-gray-600 font-body mb-4">
            {/* "Shop" link */}
            <Link href="/shop" passHref>
                <motion.a
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="hover:text-gray-800 hover:underline"
                >
                    Shop
                </motion.a>
            </Link>

            {/* Separator */}
            <HiChevronRight className="mx-2 text-gray-400" />

            {/* Category link (only if category exists) */}
            {category ? (
                <>
                    <Link href={`/shop?cat=${category}`} passHref>
                        <motion.a
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="hover:text-gray-800 hover:underline"
                        >
                            {category}
                        </motion.a>
                    </Link>
                    <HiChevronRight className="mx-2 text-gray-400" />
                </>
            ) : null}

            {/* Current product title (no link) */}
            <span className="text-gray-500">{productTitle}</span>
        </nav>
    );
}
