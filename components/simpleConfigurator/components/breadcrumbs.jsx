// components/Breadcrumbs.js
import Link from "next/link";
import { HiChevronRight } from "react-icons/hi"; // or any icon you'd like

export default function Breadcrumbs({ category, productTitle }) {
    return (
        <nav className="flex items-center text-sm text-gray-600 font-body mb-4">
            {/* "Shop" link */}
            <Link href="/shop" className="hover:text-gray-800 hover:underline">
                Shop
            </Link>

            {/* Separator */}
            <HiChevronRight className="mx-2 text-gray-400" />

            {/* Category link (only if category exists) */}
            {category ? (
                <>
                    <Link href={`/shop?cat=${category}`} className="hover:text-gray-800 hover:underline">
                        {category}
                    </Link>
                    <HiChevronRight className="mx-2 text-gray-400" />
                </>
            ) : null}

            {/* Current product title (no link) */}
            <span className="text-gray-500">{productTitle}</span>
        </nav>
    );
}
