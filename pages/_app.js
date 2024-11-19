import "@/styles/globals.css";
import { useState, useRef, useEffect } from "react";

import Menu from "../components/menu"; // Import your Menu component
import Footer from "../sections/footer"; // Import your Menu component
import { MenuProvider } from "../context/menuContext"; // Import the Menu Provider
import CartSidebar from "@/components/cart";
import useStore from "@/store/store";

import { Modal } from "../components/modal";
import Spinner from "../components/spinner";

//LIVECHAT
import TawkChat from "@/components/tawkto";

//LIBS
import { ReactLenis, useLenis } from "../libs/lenis";

export default function App({ Component, pageProps }) {
    const lenis = useLenis(({ scroll }) => {
        // called every scroll
    });

    const initializeCart = useStore((state) => state.initializeCart);
    useEffect(() => {
        initializeCart();
    }, [initializeCart]);

    const lenisRef = useRef();

    return (
        <MenuProvider>
            {" "}
            <ReactLenis ref={lenisRef} autoRaf={true} root options={{ lerp: 0.12 }}>
                <Menu /> {/* The Menu component */}
                <CartSidebar /> <TawkChat />
                <Component {...pageProps} /> <Spinner></Spinner> <Modal></Modal> <Footer></Footer>
            </ReactLenis>
        </MenuProvider>
    );
}
