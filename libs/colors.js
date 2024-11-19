// libs/colors.js

const colorDictionary = {
    "Spring Green": "#00A668",
    "Burnt Orange": "#ED6346",
    "Pale Pink": "#EAD6D7",
    "Cobalt-Blue": "#1F69B1",
    "Fire-Red": "#C30006",

    // weitere Farben hinzufügen
};

export function getColorHex(name) {
    return colorDictionary[name] || "#000000"; // Fallback auf Schwarz, falls Farbe nicht gefunden wird
}
