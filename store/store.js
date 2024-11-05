import { create } from "zustand";

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

    //SHOP DATA
    purchaseData: {
        selectedSize: null,
        uploadedGraphic: null,
        uploadedGraphicFile: null,
        xPosition: 0,
        yPosition: 0,
        scale: 1,
        containerWidth: null, // Add container width
        containerHeight: null, // Add container height
    },
    setPurchaseData: (data) =>
        set((state) => ({
            purchaseData: { ...state.purchaseData, ...data },
        })),

    modalOpen: false,
    setModalOpen: (isOpen) => set(() => ({ modalOpen: isOpen })),
    showSpinner: false,
    setShowSpinner: (show) => set(() => ({ showSpinner: show })),
    modalContent: null,
    setModalContent: (content) => set(() => ({ modalContent: content })),

    // Adding colorSpace and dpi state
    colorSpace: null,
    dpi: null,

    setColorSpace: (colorSpace) => set(() => ({ colorSpace })),
    setDpi: (dpi) => set(() => ({ dpi })),

    selectedImage: null,
    setSelectedImage: (image) => set(() => ({ selectedImage: image })),

    selectedVariant: null, // Add this to store the selected variant
    setSelectedVariant: (variant) => set(() => ({ selectedVariant: variant })), // Add setter for selectedVariant
}));

export default useStore;
