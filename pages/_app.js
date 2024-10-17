import "@/styles/globals.css";
import { useState, useRef, useEffect } from "react";

import Menu from "../components/Menu"; // Import your Menu component
import { MenuProvider } from "../context/menuContext"; // Import the Menu Provider

//LIBS
import { ReactLenis, useLenis } from "../libs/lenis";

export default function App({ Component, pageProps }) {
    const lenis = useLenis(({ scroll }) => {
        // called every scroll
        console.log(scroll);
    });

    const lenisRef = useRef();

    return (
        <MenuProvider>
            {" "}
            <ReactLenis ref={lenisRef} autoRaf={true} root options={{ lerp: 0.12 }}>
                <Menu /> {/* The Menu component */}
                <Component {...pageProps} />{" "}
            </ReactLenis>
        </MenuProvider>
    );
}
