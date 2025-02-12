// Import Zustand store
import useUserStore from "@/store/userStore";

/**
 * Berechnet den Netto-Preis für Firmenkunden.
 * @param {number} inputSum - Die Summe, die berechnet werden soll.
 * @returns {number} - Der reduzierte Betrag für Firmenkunden (Netto) oder die originale Summe.
 */
export const calculateNetPrice = (inputSum) => {
    const user = useUserStore.getState().user;

    if (user && user.userType === "firmenkunde") {
        // Firmenkunde → Netto
        return inputSum;
    } else {
        // Privatkunde → 19 % aufschlagen
        return parseFloat((Number(inputSum) * 1.19).toFixed(2));
    }
};
