import React from "react";
import { motion } from "framer-motion";
import { StepButton } from "@/components/buttons";
import { BiChevronLeft, BiChevronRight, BiShoppingBag, BiRefresh } from "react-icons/bi";

const StepIndicator = ({
    steps = [],
    currentStep = 0,
    onPrev,
    onNext,
    onSave, // used on Zusammenfassung
    isEditing = false, // changes the primary action label on Zusammenfassung
    summaryStepName = "Zusammenfassung",
    prevDisabled, // booleans from parent validation
    nextDisabled,
    className = "",
}) => {
    const total = steps.length;
    const atSummary = steps[currentStep] === summaryStepName;
    const progress = total > 1 ? (currentStep / (total - 1)) * 100 : 100;

    const handlePrev = () => {
        if (!prevDisabled && onPrev) onPrev();
    };
    const handleNext = () => {
        if (!nextDisabled && onNext) onNext();
    };
    const handlePrimary = () => {
        if (atSummary) {
            onSave?.();
        } else {
            handleNext();
        }
    };

    // primary button state/content
    const primaryDisabled = atSummary ? false : !!nextDisabled; // usually save is enabled
    const PrimaryContent = () =>
        atSummary ? (
            isEditing ? (
                <>
                    <BiRefresh className="inline-block mr-2 text-lg" />
                    Bestellung&nbsp;aktualisieren
                </>
            ) : (
                <>
                    <BiShoppingBag className="inline-block mr-2 text-lg" />
                    In&nbsp;den&nbsp;Einkaufswagen
                </>
            )
        ) : (
            <>
                Weiter
                <BiChevronRight className="inline-block ml-2 text-lg" />
            </>
        );

    return (
        <div className={`w-full font-body px-16 ${className}`}>
            {/* Desktop / Tablet */}
            <div className="hidden lg:grid grid-cols-[auto,1fr,auto] items-center gap-6">
                {/* Left: Back (styled like StepButton) */}
                <StepButton
                    onClick={handlePrev}
                    disabled={!!prevDisabled}
                    klasse="bg-textColor"
                    className="px-5 py-2 rounded-xl"
                >
                    <BiChevronLeft className="inline-block mr-2 text-lg" />
                    Zurück
                </StepButton>

                {/* Center: Indicator (larger, primary accent) */}
                <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white/80 backdrop-blur px-6 py-5 shadow-sm border border-gray-100">
                    {/* Labels */}
                    <div className="mb-3 flex items-center justify-between gap-3">
                        {steps.map((label, i) => (
                            <span
                                key={i}
                                className={`text-[12px] 2xl:text-sm tracking-wide truncate ${
                                    i === currentStep ? "text-black" : "text-gray-400"
                                }`}
                                title={label}
                            >
                                {label}
                            </span>
                        ))}
                    </div>

                    {/* Track + Progress + Dots */}
                    <div className="relative h-2 rounded-full bg-gray-200">
                        <motion.div
                            className="absolute left-0 top-0 h-full rounded-full bg-primaryColor-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-[1px]">
                            {steps.map((_, i) => {
                                const active = i <= currentStep;
                                return (
                                    <div
                                        key={i}
                                        className={`relative h-3 w-3 2xl:h-4 2xl:w-4 rounded-full border-2 ${
                                            active
                                                ? "bg-primaryColor-500 border-primaryColor-500"
                                                : "bg-white border-gray-300"
                                        }`}
                                    >
                                        {i === currentStep && (
                                            <span className="absolute inset-[-4px] rounded-full ring-2 ring-primaryColor-300" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Primary (Weiter / Save) */}
                <StepButton
                    onClick={handlePrimary}
                    disabled={primaryDisabled}
                    klasse={atSummary ? "!bg-successColor" : "bg-textColor"}
                    className="px-5 py-2 rounded-xl"
                >
                    <PrimaryContent />
                </StepButton>
            </div>

            {/* Mobile: sticky footer with compact bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 border-t border-gray-200">
                <div className="px-3 pt-2">
                    <div className="relative h-2 rounded-full bg-gray-200">
                        <motion.div
                            className="absolute left-0 top-0 h-full rounded-full bg-primaryColor-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-[1px]">
                            {steps.map((_, i) => {
                                const active = i <= currentStep;
                                return (
                                    <div
                                        key={i}
                                        className={`h-3 w-3 rounded-full border-2 ${
                                            active
                                                ? "bg-primaryColor-500 border-primaryColor-500"
                                                : "bg-white border-gray-300"
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-3 grid grid-cols-2 gap-3">
                    <StepButton
                        onClick={handlePrev}
                        disabled={!!prevDisabled}
                        klasse="bg-textColor"
                        className="py-2 rounded-xl"
                    >
                        <BiChevronLeft className="inline-block mr-2 text-lg" />
                        Zurück
                    </StepButton>

                    <StepButton
                        onClick={handlePrimary}
                        disabled={primaryDisabled}
                        klasse={atSummary ? "!bg-successColor" : "bg-textColor"}
                        className="py-2 rounded-xl"
                    >
                        <PrimaryContent />
                    </StepButton>
                </div>
            </div>
        </div>
    );
};

export default StepIndicator;
