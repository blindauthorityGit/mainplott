// utils/stepHandlers.js

// Determines if the next button should be disabled
export const isNextDisabled = (currentStep, steps, purchaseData) => {
    if (!steps || !purchaseData) return true; // Handle missing arguments
    if (steps[currentStep] === "Konfigurator" && !purchaseData.configurator) {
        return true;
    }
    if (steps[currentStep] === "Upload" && !purchaseData.sides?.front?.uploadedGraphic) {
        return true;
    }
    if (currentStep >= steps.length - 1) {
        return true;
    }
    return false;
};

// Determines if the previous button should be disabled
export const isPrevDisabled = (currentStep) => {
    return currentStep <= 0;
};

// Handles the logic for navigating to the previous step
export const handlePrevStep = (args) => {
    const { currentStep, steps, setCurrentStep, isMobile } = args;
    if (!setCurrentStep || !steps) {
        console.error("setCurrentStep or steps are undefined");
        return;
    }
    if (currentStep === steps.length - 1 && steps[currentStep]?.tryout) {
        setCurrentStep(0);
    } else {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }

    // Scroll to top on mobile
    if (isMobile) {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
};

// Handles the logic for navigating to the next step
export const handleNextStep = (args) => {
    const { currentStep, steps, setCurrentStep, purchaseData, isMobile, handleExport } = args;
    if (!setCurrentStep || !steps) {
        console.error("setCurrentStep or steps are undefined");
        return;
    }
    if (currentStep === 0 && purchaseData?.tryout) {
        setCurrentStep(steps.length - 1);
    } else {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }

    if (steps[currentStep] === "Design" && handleExport) {
        handleExport();
    }

    // Scroll to top on mobile
    if (isMobile) {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
};
