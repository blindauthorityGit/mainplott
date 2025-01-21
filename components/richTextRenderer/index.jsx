import React from "react";
import { P } from "@/components/typography";

const RichTextRenderer = ({ richText }) => {
    const renderNode = (node, index) => {
        if (!node) return null;

        switch (node.type) {
            case "root":
                return <div key={index}>{node.children.map((child, idx) => renderNode(child, idx))}</div>;

            case "paragraph":
                return (
                    <P className="pb-4 font-body" key={index}>
                        {node.children.map((child, idx) => renderNode(child, idx))}
                    </P>
                );

            case "ul":
                return (
                    <ul key={index} className="list-disc pl-6 mb-4">
                        {node.children.map((child, idx) => renderNode(child, idx))}
                    </ul>
                );

            case "li":
                return (
                    <li key={index} className="mb-2">
                        {node.children.map((child, idx) => renderNode(child, idx))}
                    </li>
                );

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
