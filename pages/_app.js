import "@/styles/globals.css";
import { useState, useRef, useEffect } from "react";

import Menu from "../components/menu"; // Import your Menu component
import Footer from "../sections/footer"; // Import your Menu component
import { MenuProvider } from "../context/menuContext"; // Import the Menu Provider
import CartSidebar from "@/components/cart";
import useStore from "@/store/store";

import { Modal } from "../components/modal";
import Spinner from "../components/spinner";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase";
import useUserStore from "@/store/userStore";
import { getUserData } from "@/config/firebase"; // Deine Funktion, um User-Daten aus Firestore zu laden

//LIVECHAT
import TawkChat from "@/components/tawkto";

//LIBS
import { ReactLenis, useLenis } from "../libs/lenis";

//COOKIE
import CookieConsentBanner from "@/components/cookie";

export default function App({ Component, pageProps }) {
    const lenis = useLenis(({ scroll }) => {
        // called every scroll
    });

    const setUser = useUserStore((state) => state.setUser);

    const initializeCart = useStore((state) => state.initializeCart);
    useEffect(() => {
        initializeCart();
    }, [initializeCart]);

    const lenisRef = useRef();

    useEffect(() => {
        // Überwache den Authentifizierungsstatus
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Benutzer ist angemeldet
                const userData = await getUserData(user.uid, process.env.NEXT_PUBLIC_DEV === "true");
                setUser({
                    uid: user.uid,
                    email: user.email,
                    userType: userData?.userType || "privatkunde", // Fallback zu "privatkunde"
                    ...userData,
                });
            } else {
                // Benutzer ist nicht angemeldet
                setUser(null);
            }
        });

        // Clean up subscription on unmount
        return () => unsubscribe();
    }, [setUser]);

    return (
        <MenuProvider>
            {" "}
            <ReactLenis ref={lenisRef} autoRaf={true} root options={{ lerp: 0.12 }}>
                <Menu /> {/* The Menu component */}
                <CartSidebar />
                {/* <TawkChat /> */}
                <Component {...pageProps} /> <Spinner></Spinner> <Modal></Modal> <Footer></Footer>
                <CookieConsentBanner />
            </ReactLenis>
        </MenuProvider>
    );
}
