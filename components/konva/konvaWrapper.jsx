import dynamic from "next/dynamic";

const KonvaLayer = dynamic(() => import("./"), { ssr: false });

export default KonvaLayer;
