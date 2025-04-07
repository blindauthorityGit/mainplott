export const analyzeImage = async (file) => {
    // Create a new FormData instance and append the file to it
    const formData = new FormData();
    formData.append("file", file);

    // Log that we're starting the function

    // Log the file name and size to verify what we're working with

    try {
        // Log before sending the request

        const response = await fetch("/api/analyzeImage", {
            method: "POST",
            body: formData,
        });

        // Log that the request has completed and check status

        const analysisResult = await response.json();

        if (response.ok) {
            // Log the analysis result if successful

            // Return the analysis results
            return {
                colorSpace: analysisResult.colorSpace,
                dpi: analysisResult.dpi,
                alpha: analysisResult.alpha,
                size: analysisResult.size,
                format: analysisResult.format,
                dimension: analysisResult.dimension,
            };
        } else {
            // Log the error message if response is not ok
            console.error("Error analyzing the image:", analysisResult.error || "Unknown error");
        }
    } catch (error) {
        // Log any error that occurs during the process
        console.error("Fehler beim Hochladen oder Analysieren der Datei. Bitte versuchen Sie es erneut.", error);
    }
};
