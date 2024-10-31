export const analyzeImage = async (file) => {
    // Create a new FormData instance and append the file to it
    const formData = new FormData();
    formData.append("file", file);

    // Log that we're starting the function
    console.log("Starting analyzeImage function...");

    // Log the file name and size to verify what we're working with
    console.log("File to upload:", file.name, "Size:", file.size, file);

    try {
        // Log before sending the request
        console.log("Sending POST request to /api/analyzeImage...");

        const response = await fetch("/api/analyzeImage", {
            method: "POST",
            body: formData,
        });

        // Log that the request has completed and check status
        console.log("Request completed with status:", response.status);

        const analysisResult = await response.json();

        if (response.ok) {
            // Log the analysis result if successful
            console.log("Analysis Result:", analysisResult);
            console.log("Color Space:", analysisResult.colorSpace);
            console.log("DPI:", analysisResult.dpi);
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
