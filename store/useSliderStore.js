import create from "zustand";

const useSliderStore = create((set) => ({
    activeSliderKey: null,
    openSlider: (key) =>
        set({
            activeSliderKey: key,
        }),
    closeSlider: () =>
        set({
            activeSliderKey: null,
        }),
}));

export default useSliderStore;
