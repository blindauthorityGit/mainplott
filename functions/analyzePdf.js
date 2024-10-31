export const analyzePdf = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("/api/analyzePdf", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Error analyzing PDF: ${response.statusText}`);
        }

        const analysisResult = await response.json();
        return analysisResult;
    } catch (error) {
        console.error("Error analyzing PDF:", error);
        throw error;
    }
};
