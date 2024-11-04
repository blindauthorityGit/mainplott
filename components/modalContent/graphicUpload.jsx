import React, { useRef } from "react";
import { H1, H2, P } from "@/components/typography";

// COMPONENTS
import { ListElement } from "@/components/list";
import { ContainImage } from "@/components/images"; // Importing the ContainImage component
import Info from "@/components/info"; // Importing the Info component
import PdfPreview from "@/components/pdfPreview"; // Import the PdfPreview component
import { StepButton } from "@/components/buttons";

// FUNCTIONS
import formatSizeInMB from "@/functions/formatSizeInMB";

// ASSETS
import Idea from "@/assets/icons/idea.svg";
import SuccessCheckmark from "@/assets/icons/successCheckmark.svg";
import ErrorCheckMark from "@/assets/icons/errorCheckmark.svg";

const GraphicUploadModalContent = ({
    file,
    dpi,
    colorSpace,
    alpha,
    size,
    format,
    dimension,
    onNewFileUpload,
    preview,
    setCurrentStep,
    setModalOpen,
    currentStep,
    steps,
}) => {
    // Validation logic
    const errors = {};
    const warnings = {};
    if (dpi < 300) {
        errors.dpi = "Bitte verwenden Sie eine Grafik mit mindestens 300 DPI.";
    }
    if (colorSpace !== "CMYK") {
        errors.colorSpace = "Bitte verwenden Sie eine Grafik im CMYK Farbraum.";
    }
    if (size > 10485760) {
        errors.size = "Datei über 10MB.";
    }
    if (!alpha || alpha == "unknown") {
        warnings.alpha = "Es könnte ein weißer Hintergrund entstehen";
    }

    const hasErrors = Object.keys(errors).length > 0;

    // Reference for the hidden file input element
    const fileInputRef = useRef(null);

    // Function to trigger file selection dialog
    const handleUploadButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle file selection change
    const handleFileChange = async (event) => {
        const newFile = event.target.files[0];
        if (newFile) {
            onNewFileUpload(newFile);
        }
    };

    // Determine if the file is a PDF
    const isPDF = file.type === "application/pdf";

    // Function to handle Next Step and close the modal
    const handleNextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
        setModalOpen(false);
    };

    return (
        <div className="grid grid-cols-12 gap-10">
            <div className="col-span-6 relative">
                <ContainImage
                    src={isPDF ? preview : URL.createObjectURL(file)}
                    mobileSrc={URL.createObjectURL(file)}
                    alt="Cover Background"
                    klasse={"absolute"}
                    className="lg:mt-20 lg:w-full relative lg:static mx-auto"
                />

                <div className="absolute -top-4 -right-6">
                    {hasErrors ? <img src={ErrorCheckMark.src} alt="" /> : <img src={SuccessCheckmark.src} alt="" />}
                </div>

                {/* Hidden file input element */}
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept=".jpeg, .jpg, .png, .pdf, .eps, .ai, .jp2, .tiff"
                    onChange={handleFileChange}
                />
            </div>
            <div className="col-span-6 flex flex-col justify-center ">
                <H2 klasse={hasErrors ? "!text-errorColor" : "!text-successColor"}>
                    {hasErrors ? "Vorsicht, es könnte Probleme geben" : "Super, alles in Ordnung!"}
                </H2>
                <p className="font-body text-gray-700 mb-8">
                    {hasErrors ? (
                        <span className="font-semibold">Die Qualität des Drucks könnte beinflusst sein.</span>
                    ) : (
                        <span className="font-semibold">Alles scheint in Ordnung zu sein</span>
                    )}
                </p>
                {isPDF ? (
                    <>
                        {/* PDF specific content */}
                        <ListElement
                            description="Seitenanzahl"
                            index={0}
                            value="1 Seite" // You can change this to a dynamic value if necessary
                        />
                        <ListElement
                            error={errors.size}
                            errorMessage={errors.size}
                            description="Größe"
                            index={1}
                            value={formatSizeInMB(size)}
                        />
                    </>
                ) : (
                    <>
                        {/* JPG/PNG specific content */}
                        <ListElement
                            error={errors.colorSpace}
                            errorMessage={errors.colorSpace}
                            description="Farbraum"
                            index={0}
                            value={colorSpace}
                        />
                        <ListElement
                            error={errors.dpi}
                            errorMessage={errors.dpi}
                            description="Pixeldichte"
                            value={dpi + " DPI"}
                        />
                        <ListElement
                            warning={warnings.alpha}
                            warningMessage={warnings.alpha}
                            description="Alphakanal"
                            index={2}
                            value={alpha && alpha !== "unknown" ? "Transparent" : "Nicht transparent"}
                        />
                        <ListElement
                            error={errors.size}
                            errorMessage={errors.size}
                            description="Größe"
                            index={3}
                            value={formatSizeInMB(size)}
                        />
                        <ListElement
                            error={warnings.format}
                            errorMessage={warnings.format}
                            description="Format"
                            index={4}
                            value={format}
                        />
                        <ListElement
                            error={warnings.format}
                            errorMessage={warnings.format}
                            description="Auflösung"
                            index={5}
                            value={dimension}
                        />
                    </>
                )}

                <Info icon={Idea.src}>
                    Um auf Nummer sicher zu gehen kannst du unseren Profi-Datencheck in Anspruch nehmen. Wir prüfen dein
                    Design auf garantierte Kompatibilität!
                </Info>
            </div>
            <div className="col-span-6 flex justify-center font-body">
                <button
                    type="button"
                    onClick={handleUploadButtonClick}
                    className="mt-4 px-4 py-2 bg-primaryColor z-50 text-white rounded-lg hover:bg-primaryColor-600"
                >
                    Neues Bild hochladen
                </button>
            </div>
            <div className="col-span-6">
                <StepButton
                    onClick={handleNextStep}
                    className="px-4 py-2 bg-textColor text-white rounded"
                    klasse="bg-textColor"
                >
                    {hasErrors ? "Trotzdem weiter" : "weiter"}
                </StepButton>
            </div>
        </div>
    );
};

export default GraphicUploadModalContent;
