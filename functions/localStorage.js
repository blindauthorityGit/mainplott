// Save cart items to localStorage
export const saveCartToLocalStorage = (cartItems) => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
};

// Load cart items from localStorage
export const loadCartFromLocalStorage = () => {
    if (typeof window === "undefined") return []; // Server-Fallback
    const stored = window.localStorage.getItem("cartItems");
    return stored ? JSON.parse(stored) : [];
};
