import { useState, useEffect } from "react";
import StepHolder from "./stepHolder";
import ColorAndSizeStep from "./steps/colorAndSizeStep";
import UploadGraphic from "./steps/uploadGraphic";
import ConfigureDesign from "./steps/configureDesign";
import DefineOptions from "./steps/defineOptions";
import Summary from "./steps/summary";
// STORE
import useStore from "@/store/store"; // Your Zustand store

const stepsConfig = [
    { id: "colorAndSize", component: ColorAndSizeStep },
    { id: "uploadGraphic", component: UploadGraphic },
    { id: "configureDesign", component: ConfigureDesign },
    { id: "defineOptions", component: DefineOptions },
    { id: "summary", component: Summary },
];

export default function ProductConfigurator({ product, sizes, colorPatternIds, variants }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);

    const { setModalOpen } = useStore();

    const CurrentStepComponent = stepsConfig[currentStep].component;

    const steps = ["Farbe / Größe", "Upload", "Design", "Optionen", "Zusammenfassung"];

    return (
        <StepHolder
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            selectedImage={selectedImage}
            variants={variants}
        >
            <CurrentStepComponent
                product={product}
                sizes={sizes}
                colorPatternIds={colorPatternIds}
                setSelectedImage={setSelectedImage}
                setCurrentStep={setCurrentStep}
                setModalOpen={setModalOpen} // Pass the modal control function
                steps={steps}
                currentStep={currentStep}
                variants={variants}
            />
        </StepHolder>
    );
}
