import { create } from "zustand";
import { v4 as uuidv4 } from "uuid"; // To generate unique IDs for each cart item
import { saveCartToLocalStorage, loadCartFromLocalStorage } from "@/functions/localStorage"; // Import the functions
const stored = loadCartFromLocalStorage();

const useStore = create((set, get) => ({
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
        id: null,

        selectedSize: null,
        configurator: "configurator",
        containerWidth: null,
        containerHeight: null,
        currentSide: "front",
        design: {},
        profiDatenCheck: false,
        configurator: null,
        quantity: 1,
        isLayout: false,
        personalisierung: null,
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
                uploadedGraphics: [
                    {
                        id: null,
                        file: File, // oder downloadURL etc.
                        width: 0,
                        height: 0,
                        xPosition: 0,
                        yPosition: 0,
                        scale: 1,
                        rotation: 0,
                    },
                ],
                activeGraphicId: null, // <--- HIER hinzufügen!
                texts: [
                    {
                        id: "123",
                        value: "Dein Text",
                        x: 400,
                        y: 100,
                        fontSize: 36,
                        fontFamily: "Roboto",
                        fill: "#333",
                        scale: 1,
                        rotation: 0,
                    },
                ],
                activeTextId: "123", // Aktuell ausgewählter Text
                activeElement: {},
                extraDecorations: 0,
            },
            back: {
                uploadedGraphic: null,
                uploadedGraphicFile: null, // Added for file metadata
                xPosition: 0,
                yPosition: 0,
                scale: 1,
                uploadedGraphics: [
                    {
                        id: null,
                        file: File, // oder downloadURL etc.
                        width: 0,
                        height: 0,
                        xPosition: 0,
                        yPosition: 0,
                        scale: 1,
                        rotation: 0,
                    },
                ],
                activeGraphicId: null, // <--- HIER hinzufügen!
                texts: [
                    {
                        id: "123",
                        value: "Dein Text",
                        x: 400,
                        y: 100,
                        fontSize: 36,
                        fontFamily: "Roboto",
                        fill: "#333",
                        scale: 1,
                        rotation: 0,
                    },
                ],
                activeTextId: "123", // Aktuell ausgewählter Text
                activeElement: {},
                extraDecorations: 0,
            },
        },
        variants: {
            size: null,
            color: null,
            quantity: 0,
        },
        extraDecorationsTotalCount: 0,
        extraDecorationsTotalCharge: 0,
    },

    setPurchaseData: (update) =>
        set((state) => {
            const currentData = state.purchaseData;
            const data = typeof update === "function" ? update(currentData) : update;
            const newState = { ...currentData, ...data };
            return JSON.stringify(newState) === JSON.stringify(currentData) ? state : { purchaseData: newState };
        }),

    resetPurchaseData: (persistentData = {}) =>
        set({
            purchaseData: {
                id: null,
                selectedSize: null,
                configurator: null,
                containerWidth: null,
                containerHeight: null,
                currentSide: "front",
                design: {},
                isLayout: false,
                profiDatenCheck: false,
                configurator: null,
                personalisierung: null,
                productName: "",
                product: null,
                quantity: 0,
                price: 0,
                sides: {
                    front: {
                        uploadedGraphic: null,
                        uploadedGraphicFile: null,
                        xPosition: 0,
                        yPosition: 0,
                        scale: 1,
                        uploadedGraphics: [],
                        activeGraphicId: null, // <--- HIER hinzufügen!
                        extraDecorations: 0,
                    },
                    back: {
                        uploadedGraphic: null,
                        uploadedGraphicFile: null,
                        xPosition: 0,
                        yPosition: 0,
                        scale: 1,
                        uploadedGraphics: [],
                        activeGraphicId: null, // <--- HIER hinzufügen!
                        extraDecorations: 0,
                    },
                },
                variants: {
                    // size: null,
                    // color: null,
                    // quantity: 0,
                },
                extraDecorationsTotalCount: 0,
                extraDecorationsTotalCharge: 0,
                extraDecorationUnitNet: 0,
                // ...persistentData, // Preserve specific values if provided
            },
        }),

    // --- helper to (re)compute extra-deco counts ---------------------
    recalcExtraDecorations: () => {
        const pd = get().purchaseData || {};
        const perSide = (side = {}) => {
            const g = Array.isArray(side.uploadedGraphics) ? side.uploadedGraphics.length : 0;
            const t = Array.isArray(side.texts) ? side.texts.length : 0;
            const total = g + t;
            // 1 decoration per side is included, extras are charged:
            return Math.max(0, total - 1);
        };

        const frontExtras = perSide(pd.sides?.front);
        const backExtras = perSide(pd.sides?.back);
        const totalCount = frontExtras + backExtras;
        const totalCharge = +(totalCount * 3.5).toFixed(2);

        set({
            purchaseData: {
                ...pd,
                sides: {
                    ...pd.sides,
                    front: { ...(pd.sides?.front || {}), extraDecorations: frontExtras },
                    back: { ...(pd.sides?.back || {}), extraDecorations: backExtras },
                },
                extraDecorationsTotalCount: totalCount,
                extraDecorationsTotalCharge: totalCharge,
            },
        });
    },

    setActiveGraphicId: (side, id) =>
        set((state) => ({
            purchaseData: {
                ...state.purchaseData,
                sides: {
                    ...state.purchaseData.sides,
                    [side]: {
                        ...state.purchaseData.sides[side],
                        activeGraphicId: id,
                    },
                },
            },
        })),

    setActiveElement: (side, type, id) =>
        set((state) => {
            const pd = state.purchaseData;
            const s = pd.sides?.[side] || {};
            return {
                purchaseData: {
                    ...pd,
                    sides: {
                        ...pd.sides,
                        [side]: {
                            ...s,
                            activeElement: { type, id },
                            // Backwards-compat:
                            activeTextId: type === "text" ? id : s.activeTextId,
                            activeGraphicId: type === "graphic" ? id : s.activeGraphicId,
                        },
                    },
                },
            };
        }),

    addText: (side, props = {}) =>
        set((state) => {
            const id = uuidv4();
            const pd = state.purchaseData;
            const s = pd.sides?.[side] || {};

            // Bounding-Box oder Containergröße heranziehen
            const br = pd.boundingRect || {
                x: 0,
                y: 0,
                width: pd.containerWidth || 800,
                height: pd.containerHeight || 800,
            };

            const centerX = br.x + br.width / 2;
            // etwas oberhalb der Mitte positionieren → z.B. 35 % der Höhe
            const chestY = br.y + br.height * 0.35;

            const base = {
                id,
                value: "Dein Text",
                x: centerX,
                y: chestY,
                fontSize: 18,
                fontFamily: "Roboto",
                fill: "#000000",
                scale: 1,
                rotation: 0,
                // Boxbreite auf ca. 85 % der Druckfläche beschränken
                boxWidth: Math.min(br.width, (pd.containerWidth || 800) * 0.85),
                align: "center",
                ...props,
            };

            const texts = Array.isArray(s.texts) ? [...s.texts, base] : [base];

            const next = {
                purchaseData: {
                    ...pd,
                    sides: {
                        ...pd.sides,
                        [side]: {
                            ...s,
                            texts,
                            activeTextId: id,
                            activeElement: { type: "text", id },
                        },
                    },
                },
            };
            setTimeout(() => get().recalcExtraDecorations(), 0);
            return next;
        }),

    addTextCentered: (side, boundingRect) =>
        set((state) => {
            const id = uuidv4();
            const pd = state.purchaseData;
            const s = pd.sides?.[side] || {};

            // Mittelpunkt der Druckfläche (boundingRect aus KonvaLayer)
            const cx = boundingRect.x + boundingRect.width / 2;
            const cy = boundingRect.y + boundingRect.height / 2;

            const fontSize = 36;
            const boxWidth = Math.round((boundingRect.width || 500) * 0.6);

            const base = {
                id,
                value: "Neuer Text",
                fontSize,
                fontFamily: "Roboto",
                boxWidth,
                align: "center",
                x: cx - boxWidth / 2,
                y: cy - fontSize / 2,
                scale: 1,
                rotation: 0,
                fill: "#000",
                curvature: 0,
            };

            const texts = Array.isArray(s.texts) ? [...s.texts, base] : [base];

            const next = {
                purchaseData: {
                    ...pd,
                    sides: {
                        ...pd.sides,
                        [side]: {
                            ...s,
                            texts,
                            activeTextId: id,
                            activeElement: { type: "text", id },
                        },
                    },
                },
            };
            setTimeout(() => get().recalcExtraDecorations(), 0);
            return next;
        }),

    updateText: (side, id, patch) =>
        set((state) => {
            const pd = state.purchaseData;
            const s = pd.sides?.[side] || {};
            const texts = (s.texts || []).map((t) => (t.id === id ? { ...t, ...patch } : t));
            return {
                purchaseData: {
                    ...pd,
                    sides: {
                        ...pd.sides,
                        [side]: { ...s, texts },
                    },
                },
            };
        }),

    // clearPurchaseData: () =>
    //     set(
    //         purchaseData: { ...state.purchaseData, ...data },
    //     ),

    // Cart Items Array and Functions
    cartItems: typeof window !== "undefined" ? loadCartFromLocalStorage() : [], // Server-Fallback
    // … restlicher State …
    // our new cache:
    blobCache: {},

    // store a Blob under a given item id
    cacheBlob: (id, blob) =>
        set((state) => ({
            blobCache: {
                ...state.blobCache,
                [id]: blob,
            },
        })),

    // retrieve the cached Blob (or undefined)
    getCachedBlob: (id) => get().blobCache[id],

    // Load cart from localStorage on initialization
    initializeCart: () => {
        const storedCartItems = loadCartFromLocalStorage();
        set({ cartItems: storedCartItems });
    },
    // Sidebar visibility
    isCartSidebarOpen: false,
    openCartSidebar: () => set({ isCartSidebarOpen: true }),
    closeCartSidebar: () => set({ isCartSidebarOpen: false }),

    addCartItem: (item) =>
        set((state) => {
            // if item.id already exists, use it; otherwise generate
            const id = item.id || uuidv4();
            const newItem = { ...item, id };
            const updatedCartItems = [...state.cartItems, newItem];
            saveCartToLocalStorage(updatedCartItems);
            return { cartItems: updatedCartItems };
        }),

    replaceCartItems: (items) => set({ cartItems: items }),

    // Remove item from cart by id
    removeCartItem: (id) => {
        set((state) => {
            const updatedCartItems = state.cartItems.filter((item) => item.id !== id);
            localStorage.setItem("cartItems", JSON.stringify(updatedCartItems)); // Update localStorage
            return { cartItems: updatedCartItems };
        });
    },

    // optional helper: set once when product page loads
    setExtraDecorVariantId: (id) =>
        set((state) => ({
            purchaseData: { ...state.purchaseData, extraDecorationVariantId: id },
        })),

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
            cartItems: state.cartItems.map((it) => (it.id === id ? { ...it, ...updatedData } : it)),
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

    isMobileSliderOpen: false, // Boolean to indicate if *any* slider is open
    openMobileSlider: () => set(() => ({ isMobileSliderOpen: true })),
    closeMobileSlider: () => set(() => ({ isMobileSliderOpen: false })),

    showMobileSteps: true, // By default, we want the mobile steps visible
    hideMobileSteps: () => set(() => ({ showMobileSteps: false })),
    revealMobileSteps: () => set(() => ({ showMobileSteps: true })),
}));

export default useStore;
