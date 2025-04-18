import "@/styles/globals.css";
import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Router from "next/router"; // Import Router directly
import Menu from "../components/menu";
import Footer from "../sections/footer";
import { MenuProvider } from "../context/menuContext";
import CartSidebar from "@/components/cart";
import useStore from "@/store/store";
import { Modal } from "../components/modal";
import Spinner from "../components/spinner";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase";
import useUserStore from "@/store/userStore";
import { getUserData } from "@/config/firebase";
import TawkChat from "@/components/tawkto";
import { ReactLenis, useLenis } from "../libs/lenis";
import CookieConsentBanner from "@/components/cookie";
import useIsMobile from "@/hooks/isMobile";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
    // This effect will scroll to the top on every route change.
    const isMobile = useIsMobile();

    console.log(isMobile);
    const router = useRouter();
    const clearCart = useStore((state) => state.clearCart);

    useEffect(() => {
        // Wait until router is ready (hydrated) so that query parameters are available
        if (!router.isReady) return;
        if (router.query.done === "true") {
            console.log("Query done=true detected. Clearing cart...");
            clearCart();
        }
    }, [router.isReady, router.query.done, clearCart]);

    useEffect(() => {
        const handleRouteChange = () => {
            // If you use Lenis and need to scroll using its API, you could do:
            // lenisRef.current.scrollTo(0, 0);
            window.scrollTo(0, 0);
        };

        // Log to ensure the effect is mounting

        Router.events.on("routeChangeComplete", handleRouteChange);
        return () => {
            Router.events.off("routeChangeComplete", handleRouteChange);
        };
    }, []);

    const lenis = useLenis(({ scroll }) => {
        // Called on every scroll if needed
    });
    const setUser = useUserStore((state) => state.setUser);
    const initializeCart = useStore((state) => state.initializeCart);

    useEffect(() => {
        initializeCart();
    }, [initializeCart]);

    const lenisRef = useRef();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userData = await getUserData(user.uid, process.env.NEXT_PUBLIC_DEV === "true");
                setUser({
                    uid: user.uid,
                    email: user.email,
                    userType: userData?.userType || "privatkunde",
                    ...userData,
                });
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, [setUser]);

    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.ico" />
                {/* Other global head tags */}
            </Head>
            <MenuProvider>
                <ReactLenis ref={lenisRef} autoRaf={true} root options={{ lerp: 0.08 }}>
                    <Menu />
                    <CartSidebar />
                    {!isMobile && <TawkChat />}
                    <Component {...pageProps} />
                    <Spinner />
                    <Modal />
                    <Footer />
                    <CookieConsentBanner />
                </ReactLenis>
            </MenuProvider>
        </>
    );
}
