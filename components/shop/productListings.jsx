import ProductCard from "./productCard";

function ProductListings({ products }) {
    return (
        <div className="py-12 max-w-6xl col-span-10 mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
            {products.map((product, index) => (
                <ProductCard key={index} product={product} />
            ))}
        </div>
    );
}

export default ProductListings;