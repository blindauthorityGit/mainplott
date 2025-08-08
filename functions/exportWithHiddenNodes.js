// utils/exportWithHiddenNodes.js
export function exportWithHiddenNodes({ stageRef, nodes = [], exportFn }) {
    // Sichtbarkeiten merken
    const vis = nodes.map((n) => (n ? n.visible() : null));

    // Verstecken
    nodes.forEach((n) => n && n.visible(false));
    stageRef.current?.batchDraw();

    // Export ausführen (deine bestehende Funktion)
    const dataURL = exportFn();

    // Sichtbarkeiten zurück
    nodes.forEach((n, i) => n && n.visible(vis[i]));
    stageRef.current?.batchDraw();

    return dataURL;
}
