// Import Zustand store
import useUserStore from "@/store/userStore";

/**
 * Berechnet den Netto-Preis für Firmenkunden.
 * @param {number} inputSum - Die Summe, die berechnet werden soll.
 * @returns {number} - Der reduzierte Betrag für Firmenkunden (Netto) oder die originale Summe.
 */
export const calculateNetPrice = (inputSum) => {
    // Hole den User aus dem Zustand
    const user = useUserStore.getState().user;

    // Prüfe, ob ein User vorhanden ist und ob er ein Firmenkunde ist
    if (user && user.userType === "firmenkunde") {
        // Berechne Netto-Preis: Reduziere um 19% und runde auf 2 Dezimalstellen
        const netPrice = parseFloat((Number(inputSum) / 1.19).toFixed(2));
        return netPrice;
    }

    // Wenn kein User oder kein Firmenkunde, gib die originale Summe zurück
    return inputSum;
};
