import ProductCard from "./productCard";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations
const containerVariants = {
    visible: {
        transition: {
            staggerChildren: 0.1, // Delay between each card animation
        },
    },
};
function ProductListings({ products }) {
    return (
        <motion.div
            className="py-2 lg:py-12 max-w-6xl col-span-12 lg:col-span-9 mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-1 gap-y-2 lg:gap-x-4 lg:gap-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <AnimatePresence>
                {products.map((product) => (
                    <motion.div
                        key={product.node.handle}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <ProductCard product={product} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
}

export default ProductListings;
