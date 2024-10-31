import { useState, useEffect } from "react";
import StepHolder from "./stepHolder";
import ColorAndSizeStep from "./steps/colorAndSizeStep";
import UploadGraphic from "./steps/uploadGraphic";

const stepsConfig = [
    { id: "colorAndSize", component: ColorAndSizeStep },
    { id: "uploadGraphic", component: UploadGraphic },
];

export default function ProductConfigurator({ product, sizes, colorPatternIds }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);

    const CurrentStepComponent = stepsConfig[currentStep].component;

    const steps = ["Farbe und Größe", "Grafik hochladen", "Bild platzieren", "Zusätzliche Optionen"];

    return (
        <StepHolder
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            selectedImage={selectedImage}
        >
            <CurrentStepComponent
                product={product}
                sizes={sizes}
                colorPatternIds={colorPatternIds}
                setSelectedImage={setSelectedImage}
            />
        </StepHolder>
    );
}
