import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion for animations
import { React, useState, useEffect, useRef, forwardRef } from "react";
import useStore from "@/store/store"; // Your Zustand store
import { StepButton } from "@/components/buttons";
import ContentWrapper from "./components/content/index";
import CustomTextField from "@/components/inputs/customTextField";
import QuantitySelector from "@/components/inputs/quantitySelector";
import { P, H3 } from "@/components/typography";
import dynamic from "next/dynamic";

//Hooks
import useIsMobile from "@/hooks/isMobile";

//FUNCTIONS
import { isNextDisabled, isPrevDisabled, handlePrevStep, handleNextStep } from "@/functions/stepHandlers";

// Dynamically import the KonvaLayer component with no SSR
const KonvaLayer = dynamic(() => import("@/components/konva"), { ssr: false });
// import KonvaLayer from "@/components/konva/konvaWrapper"; // Normal import
// import KonvaLayerWithRef from "@/components/konva/konvaWrapper"; // Adjust the path to your wrapper

export default function SimpleConfigurator({ product }) {
    const {
        purchaseData,
        setPurchaseData,
        selectedVariant,

        openCartSidebar,
        addCartItem,
    } = useStore();

    const [selectedImage, setSelectedImage] = useState(null); // Start with the first image
    const [inputValue, setInputValue] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);

    const containerRef = useRef(); // Add a reference to the container
    const isMobile = useIsMobile();

    useEffect(() => {
        setSelectedImage(product.images.edges[0].node.originalSrc);
    }, [product]);

    useEffect(() => {
        setPrice(product.variants.edges[0].node.priceV2.amount);
    }, [product]);

    const handlePrevStep = () => {
        if (currentStep == steps.length - 1 && purchaseData.tryout) {
            setCurrentStep(0);
        } else {
            setCurrentStep((prev) => Math.max(prev - 1, 0));
        }
        // Scroll to top on mobile
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleNextStep = () => {
        if (currentStep == 0 && purchaseData.tryout) {
            setCurrentStep(steps.length - 1);
        } else {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
        if (steps[currentStep] == "Design") {
            handleExport();
        }
        // Scroll to top on mobile
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        console.log(purchaseData);
    };

    // Animation variants for the image - simple fade in/out
    const fadeAnimationVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    };

    // Determine if "Next" button should be disabled
    const isNextDisabled = () => {
        if (steps[currentStep] === "Konfigurator" && !purchaseData.configurator) {
            return true;
        }

        if (steps[currentStep] === "Upload" && !purchaseData.sides["front"].uploadedGraphic) {
            return true;
        }
        if (currentStep === steps.length - 1) {
            return true;
        }
        return false;
    };

    const handleInputChange = (newValue) => {
        setInputValue(newValue);
        console.log("New value:", newValue);
        // Update the purchaseData state
        setPurchaseData({
            ...purchaseData,
            personalisierung: newValue, // Add or update personalisierung
        });
    };

    const handleQuantityChange = (newQuantity) => {
        setQuantity(newQuantity);
        console.log(purchaseData);
        // Update the quantity in   the purchaseData state
        setPurchaseData({
            ...purchaseData,
            quantity: newQuantity, // Add or update quantity
        });
    };

    console.log(product);

    useEffect(() => {
        // Ensure quantity is initialized to 1 if not already set
        if (!purchaseData.quantity || purchaseData.quantity === 0) {
            setPurchaseData({
                ...purchaseData,
                quantity: 1,
            });
        }
    }, []);

    useEffect(() => {
        // Calculate the total price whenever quantity or price changes
        const totalPrice = Number(price) * (purchaseData.quantity || 1);

        setPurchaseData({
            ...purchaseData,
            price: totalPrice, // Update price in purchaseData
        });
    }, [price, purchaseData.quantity]);

    return (
        <div className="grid grid-cols-12 lg:px-24 lg:gap-4 h-full">
            {/* Left - Product Image / Konva Layer with fade in/out animation */}
            <div className="col-span-12 lg:col-span-6 relative mb-4 lg:mb-0" ref={containerRef}>
                <div className="w-full flex items-center justify-center lg:min-h-[664px] lg:max-h-[664px] relative">
                    <AnimatePresence mode="wait">
                        <img
                            key={selectedImage}
                            src={selectedImage}
                            alt="Main Product"
                            className="w-full object-contain lg:max-h-[664px]"
                        />{" "}
                    </AnimatePresence>
                </div>
                <div className="flex mt-4  gap-2">
                    {product.images.edges.map((image, index) => (
                        <img
                            key={index}
                            src={image.node.originalSrc}
                            alt={`Thumbnail ${index + 1}`}
                            className={`w-16 h-16 cursor-pointer object-cover border-2 ${
                                selectedImage === image.node.originalSrc ? "border-primaryColor" : "border-gray-300"
                            }`}
                            onClick={() => setSelectedImage(image.node.originalSrc)} // Update the main image on click
                        />
                    ))}
                </div>
            </div>

            {/* Right - Step Indicator, Dynamic Content, Buttons */}
            <div className="col-span-12 lg:col-span-6 lg:pt-2 flex flex-col h-full">
                {/* Dynamic Content with entry/exit animation */}
                <div className="flex-grow mb-8 px-4 lg:px-0">
                    <AnimatePresence mode="wait" layout initial={false}>
                        <motion.div
                            layout
                            key={"currentSdddtep"}
                            initial={{ opacity: 0, x: -10 }} // Slide from left for entry animation
                            animate={{ opacity: 1, x: 0 }} // Fade in and position to center
                            exit={{ opacity: 0, x: 10 }} // Slide out to the right for exit animation
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            // style={{ willChange: "auto" }}
                            // // Enable position layout animations
                            // layoutScroll // Keep layout changes from affecting scrollable/fixed elements
                        >
                            <ContentWrapper product={product}></ContentWrapper>{" "}
                            <div className="lg:px-16 mt-8">
                                <P klasse="lg:!text-sm">{product?.textPersonalisierung?.value}</P>
                                <CustomTextField
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    maxLength={80}
                                    placeholder="Personalisierung...."
                                ></CustomTextField>
                                <QuantitySelector
                                    quantity={purchaseData.quantity || 1} // Fallback to 1 if undefined or null
                                    setQuantity={(newQuantity) =>
                                        setPurchaseData({
                                            ...purchaseData,
                                            quantity: newQuantity, // Update with resolved value
                                        })
                                    }
                                    onQuantityChange={(newQuantity) => console.log("Quantity updated:", newQuantity)}
                                ></QuantitySelector>
                                <H3 klasse="!mb-2 mt-8">
                                    {" "}
                                    EUR{" "}
                                    {purchaseData.price
                                        ? purchaseData.price.toFixed(2)
                                        : (price * (purchaseData.quantity || 1)).toFixed(2)}
                                </H3>
                            </div>
                        </motion.div>
                    </AnimatePresence>{" "}
                    <div className="mt-auto lg:flex justify-end hidden lg:px-16 lg:mt-8">
                        <StepButton
                            onClick={() => {
                                addCartItem({ ...purchaseData, selectedImage }), openCartSidebar();
                            }}
                            className="px-4 py-2 !bg-successColor text-white rounded"
                            klasse="!bg-successColor"
                            disabled={!purchaseData.personalisierung}
                        >
                            in den EInkaufwagen
                        </StepButton>
                    </div>
                </div>

                {/* Navigation Buttons - Positioned at the bottom */}
            </div>
        </div>
    );
}
