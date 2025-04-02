const formatPrice = (amount) => {
    return new Intl.NumberFormat("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export default formatPrice;
