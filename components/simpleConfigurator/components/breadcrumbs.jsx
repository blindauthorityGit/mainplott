// components/Breadcrumbs.js
import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";
import { motion } from "framer-motion";

// Helper function to shorten a given text if it exceeds maxCharCount
const shortenText = (text, maxCharCount) => {
    // Ensure text is a string and check its length
    if (typeof text !== "string") return text;
    return text.length > maxCharCount ? text.substring(0, maxCharCount) + "..." : text;
};

export default function Breadcrumbs({ category, productTitle }) {
    // Define maximum characters allowed for the product title
    const maxCharCount = 25; // Change this number as needed
    // Get the shortened product title using the helper function
    const shortenedTitle = shortenText(productTitle, maxCharCount);

    return (
        <nav className="flex items-center text-xs p-2 lg:p-0 text-gray-600 font-body mb-4">
            {/* "Shop" link */}
            <Link href="/shop" passHref>
                <motion.div
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="hover:text-gray-800 hover:underline"
                >
                    Shop
                </motion.div>
            </Link>

            {/* Separator */}
            <HiChevronRight className="mx-2 text-gray-400" />

            {/* Category link (only if category exists) */}
            {category ? (
                <>
                    <Link href={`/shop?cat=${category}`} passHref>
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="hover:text-gray-800 hover:underline"
                        >
                            {category}
                        </motion.div>
                    </Link>
                    <HiChevronRight className="mx-2 text-gray-400" />
                </>
            ) : null}

            {/* Current product title (shortened if it exceeds the max character count) */}
            <span className="text-gray-500">{shortenedTitle}</span>
        </nav>
    );
}
