import React from "react";

const RichTextRenderer = ({ richText }) => {
    const renderNode = (node, index) => {
        if (!node) return null;

        // Log the current node for debugging
        // console.log("Rendering Node:", node);

        switch (node.type) {
            case "root":
                return <div key={index}>{node.children.map((child, idx) => renderNode(child, idx))}</div>;

            case "paragraph":
                return <p key={index}>{node.children.map((child, idx) => renderNode(child, idx))}</p>;

            case "text":
                const styles = {};
                if (node.bold) styles.fontWeight = "bold";

                return (
                    <span key={index} style={styles}>
                        {node.value}
                    </span>
                );

            default:
                console.warn(`Unsupported node type: ${node.type}`);
                return null;
        }
    };

    // Ensure we only try rendering if `richText` is valid
    if (!richText || !richText.type || richText.type !== "root") {
        console.error("Invalid richText format:", richText);
        return null;
    }

    return <div>{renderNode(richText)}</div>;
};

export default RichTextRenderer;
