import { create } from "zustand";
import { v4 as uuidv4 } from "uuid"; // To generate unique IDs for each cart item
import { saveCartToLocalStorage, loadCartFromLocalStorage } from "@/functions/localStorage"; // Import the functions

const useStore = create((set) => ({
    activeCategory: "",
    activeSubCategory: "",
    activeTags: [],

    setActiveCategory: (category) => set({ activeCategory: category }),
    setActiveSubCategory: (category) => set({ activeSubCategory: category }),
    setActiveTags: (tags) => set({ activeTags: tags }),

    addTag: (tag) =>
        set((state) => ({
            activeTags: [...state.activeTags, tag],
        })),

    removeTag: (tag) =>
        set((state) => ({
            activeTags: state.activeTags.filter((t) => t !== tag),
        })),

    // SHOP DATA
    purchaseData: {
        selectedSize: null,
        containerWidth: null,
        containerHeight: null,
        currentSide: "front",
        profiDatenCheck: false,
        configurator: null,
        productName: "",
        product: null,
        price: 0,
        sides: {
            front: {
                uploadedGraphic: null,
                uploadedGraphicFile: null, // Added for file metadata
                xPosition: 0,
                yPosition: 0,
                scale: 1,
            },
            back: {
                uploadedGraphic: null,
                uploadedGraphicFile: null, // Added for file metadata
                xPosition: 0,
                yPosition: 0,
                scale: 1,
            },
        },
        variants: {
            size: null,
            color: null,
            quantity: 0,
        },
    },

    setPurchaseData: (data) =>
        set((state) => {
            const newState = { ...state.purchaseData, ...data };
            return JSON.stringify(newState) === JSON.stringify(state.purchaseData) ? state : { purchaseData: newState };
        }),

    resetPurchaseData: (persistentData = {}) =>
        set({
            purchaseData: {
                selectedSize: null,
                containerWidth: null,
                containerHeight: null,
                currentSide: "front",
                profiDatenCheck: false,
                configurator: null,
                productName: "",
                product: null,
                price: 0,
                sides: {
                    front: {
                        uploadedGraphic: null,
                        uploadedGraphicFile: null,
                        xPosition: 0,
                        yPosition: 0,
                        scale: 1,
                    },
                    back: {
                        uploadedGraphic: null,
                        uploadedGraphicFile: null,
                        xPosition: 0,
                        yPosition: 0,
                        scale: 1,
                    },
                },
                variants: null,
                // ...persistentData, // Preserve specific values if provided
            },
        }),

    // clearPurchaseData: () =>
    //     set(
    //         purchaseData: { ...state.purchaseData, ...data },
    //     ),

    // Cart Items Array and Functions
    cartItems: [],

    // Load cart from localStorage on initialization
    initializeCart: () => {
        const storedCartItems = loadCartFromLocalStorage();
        set({ cartItems: storedCartItems });
    },
    // Sidebar visibility
    isCartSidebarOpen: false,
    openCartSidebar: () => set({ isCartSidebarOpen: true }),
    closeCartSidebar: () => set({ isCartSidebarOpen: false }),

    addCartItem: (item) => {
        set((state) => {
            const updatedCartItems = [...state.cartItems, { ...item, id: uuidv4() }];
            saveCartToLocalStorage(updatedCartItems); // Save to local storage if needed
            return { cartItems: updatedCartItems };
        });
    },

    // Remove item from cart by id
    removeCartItem: (id) => {
        set((state) => {
            const updatedCartItems = state.cartItems.filter((item) => item.id !== id);
            localStorage.setItem("cartItems", JSON.stringify(updatedCartItems)); // Update localStorage
            return { cartItems: updatedCartItems };
        });
    },

    addToCart: () =>
        set((state) => ({
            cartItems: [
                ...state.cartItems,
                {
                    ...JSON.parse(JSON.stringify(state.purchaseData)), // Deep copy purchaseData
                    id: uuidv4(), // Unique identifier for the item
                },
            ],
        })),

    removeFromCart: (id) =>
        set((state) => ({
            cartItems: state.cartItems.filter((item) => item.id !== id),
        })),

    clearCart: () => set({ cartItems: [] }),

    updateCartItem: (id, updatedData) =>
        set((state) => ({
            cartItems: state.cartItems.map((item) => (item.id === id ? { ...item, ...updatedData } : item)),
        })),

    // Modal and Spinner
    modalOpen: false,
    setModalOpen: (isOpen) => set(() => ({ modalOpen: isOpen })),
    showSpinner: false,
    setShowSpinner: (show) => set(() => ({ showSpinner: show })),
    modalContent: null,
    setModalContent: (content) => set(() => ({ modalContent: content })),

    // Additional State
    colorSpace: null,
    dpi: null,
    setColorSpace: (colorSpace) => set(() => ({ colorSpace })),
    setDpi: (dpi) => set(() => ({ dpi })),

    selectedImage: null,
    setSelectedImage: (image) => set(() => ({ selectedImage: image })),
    selectedVariant: null,
    setSelectedVariant: (variant) => set(() => ({ selectedVariant: variant })),

    configuredImage: null, // Initially no configured image
    setConfiguredImage: (image) => set({ configuredImage: image }), // Set the configured image
    resetConfiguredImage: () => set({ configuredImage: null }), // Reset the configured image

    // Refs for Konva components
    stageRef: null,
    transformerRef: null,
    boundaryPathRef: null,
    // Setters for the refs
    setStageRef: (ref) => set({ stageRef: ref }),
    setTransformerRef: (ref) => set({ transformerRef: ref }),
    setBoundaryPathRef: (ref) => set({ boundaryPathRef: ref }),

    // Clear refs (optional utility for cleanup)
    clearRefs: () => set({ stageRef: null, transformerRef: null, boundaryPathRef: null }),
}));

export default useStore;
