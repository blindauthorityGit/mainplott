import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";

import StepHolder from "./stepHolder";
import ColorAndSizeStep from "./steps/colorAndSizeStep";
import ChooseWay from "./steps/chooseWay";
import UploadGraphic from "./steps/uploadGraphic";
import LayoutStep from "./steps/layoutStep";
import ConfigureDesign from "./steps/configureDesign";
import DefineOptions from "./steps/defineOptions";
import Summary from "./steps/summary";
// STORE
import useStore from "@/store/store"; // Your Zustand store

export default function ProductConfigurator({
    product,
    sizes,
    colorPatternIds,
    variants,
    veredelungen,
    profiDatenCheck,
    layoutService,
}) {
    const router = useRouter();
    const { purchaseData, setPurchaseData, resetPurchaseData } = useStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        // Reset purchaseData on URL change

        resetPurchaseData();
    }, [router.asPath]);

    useEffect(() => {
        // Set product info into the store
        setPurchaseData((prev) => ({
            ...prev,
            productName: product.title,
            product: product,
        }));
    }, [product, setPurchaseData]);

    // Build steps configuration based on purchaseData.isLayout
    const stepsConfig = useMemo(() => {
        if (purchaseData.isLayout) {
            return [
                { id: "colorAndSize", component: ColorAndSizeStep },
                { id: "chooseWay", component: ChooseWay },
                { id: "layout", component: LayoutStep },
                { id: "defineOptions", component: DefineOptions },
                { id: "summary", component: Summary },
            ];
        } else {
            return [
                { id: "colorAndSize", component: ColorAndSizeStep },
                { id: "chooseWay", component: ChooseWay },
                { id: "uploadGraphic", component: UploadGraphic },
                { id: "configureDesign", component: ConfigureDesign },
                { id: "defineOptions", component: DefineOptions },
                { id: "summary", component: Summary },
            ];
        }
    }, [purchaseData.isLayout]);

    // Build step labels accordingly
    const steps = useMemo(() => {
        if (purchaseData.isLayout) {
            return ["Farbe / Größe", "Konfigurator", "Layout", "Optionen", "Zusammenfassung"];
        } else {
            return ["Farbe / Größe", "Konfigurator", "Upload", "Design", "Optionen", "Zusammenfassung"];
        }
    }, [purchaseData.isLayout]);

    const CurrentStepComponent = stepsConfig[currentStep].component;

    return (
        <StepHolder
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            selectedImage={selectedImage}
            variants={variants}
            veredelungen={veredelungen}
        >
            <CurrentStepComponent
                product={product}
                sizes={sizes}
                colorPatternIds={colorPatternIds}
                setSelectedImage={setSelectedImage}
                setCurrentStep={setCurrentStep}
                setModalOpen={null} // Pass modal control function if needed
                steps={steps}
                currentStep={currentStep}
                variants={variants}
                veredelungen={veredelungen}
                profiDatenCheck={profiDatenCheck}
                layoutService={layoutService}
            />
        </StepHolder>
    );
}
