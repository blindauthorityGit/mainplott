// pages/_app.js
import "@/styles/globals.css";
import { useState, useRef, useEffect } from "react";
import client from "../client"; // Import the Sanity client
import Head from "next/head";
import Router from "next/router";
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
    const isMobile = useIsMobile();
    const router = useRouter();
    const clearCart = useStore((state) => state.clearCart);

    // this will hold your Sanity toggle
    const [liveChatEnabled, setLiveChatEnabled] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;
        if (router.query.done === "true") {
            clearCart();
        }
    }, [router.isReady, router.query.done, clearCart]);

    // fetch your “liveChatEnabled” boolean from the settings singleton
    useEffect(() => {
        client
            .fetch(`*[_type == "settingsSingleton"][0].liveChat`)
            .then((enabled) => {
                console.log(!!enabled);
                setLiveChatEnabled(!!enabled);
                console.log("livechat is here");
            })
            .catch((err) => {
                console.error("Failed to fetch liveChatEnabled", err);
            });
    }, []);

    useEffect(() => {
        const handleRouteChange = () => window.scrollTo(0, 0);
        Router.events.on("routeChangeComplete", handleRouteChange);
        return () => Router.events.off("routeChangeComplete", handleRouteChange);
    }, []);

    const lenis = useLenis();
    const lenisRef = useRef();
    const setUser = useUserStore((s) => s.setUser);
    const initializeCart = useStore((s) => s.initializeCart);

    useEffect(() => {
        initializeCart();
    }, [initializeCart]);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const data = await getUserData(user.uid, process.env.NEXT_PUBLIC_DEV === "true");
                setUser({ uid: user.uid, email: user.email, ...data });
            } else {
                setUser(null);
            }
        });
        return () => unsub();
    }, [setUser]);

    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MenuProvider>
                <ReactLenis ref={lenisRef} autoRaf={true} root options={{ lerp: 0.08 }}>
                    <Menu />
                    <CartSidebar />

                    {/** only show TawkChat if not mobile *and* the flag is true */}
                    {!isMobile && liveChatEnabled && <TawkChat />}

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
