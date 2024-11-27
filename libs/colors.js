// libs/colors.js

const colorDictionary = {
    "Spring Green": "#00A668",
    "Burnt Orange": "#ED6346",
    "Pale Pink": "#EAD6D7",
    "Cobalt-Blue": "#1F69B1",
    "Fire-Red": "#C30006",
    Schwarz: "#000000",
    Weiß: "#FFFFFF",
    Chocolate: "#695650",
    Clay: "#998C7C",
    "Dark Olive": "#454136",
    "Deep Green": "#524F46",
    "Deep Red": "#A20A31",
    Denim: "#333F61",
    Flintstone: "#7D889F",
    "Forest Green": "#0D5432",
    Grape: "#75555A",
    "Ice Blue": "#CFD8DD",
    Indigo: "#1C3055",
    Kit: "#A1907C",
    "Leaf Green": "#798173",
    "Light Blue": "#A8C8E1",
    Navy: "#272E48",
    "Powder Grey": "#656668",
    Red: "#98002D",
    Wine: "#611F3B",
    "Off White": "#ECE8DD",
    Lilac: "#E1DFED",
    Rope: "#CAB7A8",
    Gelb: "#FFE500",
    Orange: "#FF8A00",

    // weitere Farben hinzufügen
};

export function getColorHex(name) {
    return colorDictionary[name] || "#000000"; // Fallback auf Schwarz, falls Farbe nicht gefunden wird
}
