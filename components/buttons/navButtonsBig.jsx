import { motion } from "framer-motion";
import { VscChevronLeft, VscChevronRight } from "react-icons/vsc";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Button = ({ href, onClick, children }) => (
    <Link href={href}>
        <motion.a
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="p-2 cursor-pointer opacity-60 hover:opacity-100 text-8xl font-thin rounded-full bg-primaryColor-100 hover:bg-primaryColor-200"
        >
            {children}
        </motion.a>
    </Link>
);

const TwoButtonsBig = ({ onLeftClick, onRightClick, currentIndex, dataAll }) => {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ArrowLeft") {
                onLeftClick();
            } else if (event.key === "ArrowRight") {
                onRightClick();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onLeftClick, onRightClick]);

    return (
        <div className="absolute hidden lg:block top-1/2 px-3 transform -translate-y-1/2  w-full z-20">
            <div className="flex justify-between">
                <Button href={`/galerie/${dataAll[Math.max(0, currentIndex - 1)].slug.current}`} onClick={onLeftClick}>
                    <VscChevronLeft />
                </Button>
                <Button
                    href={`/galerie/${dataAll[Math.min(dataAll.length - 1, currentIndex + 1)].slug.current}`}
                    onClick={onRightClick}
                >
                    <VscChevronRight />
                </Button>
            </div>
        </div>
    );
};

export default TwoButtonsBig;
