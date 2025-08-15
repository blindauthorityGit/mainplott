// components/CartSidebar.jsx

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import useStore from "@/store/store";
import { FiTrash2, FiX, FiEdit2, FiFileText } from "react-icons/fi";
import Overlay from "../modal/overlay";
import { H5, P, H3 } from "@/components/typography";
import { TextField } from "@mui/material";
import prepareLineItems from "@/functions/prepareLineItems";
import { createCart } from "@/libs/shopify";
import dynamic from "next/dynamic";
import { auth, createPendingOrder, upsertLibraryAsset } from "@/config/firebase";

const PDFDownloadLink = dynamic(() => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink), { ssr: false });
import CartOfferPDF from "@/components/pdf/cartOfferPDF";

export default function CartSidebar() {
    const { cartItems, isCartSidebarOpen, closeCartSidebar, removeCartItem, setModalContent, setModalOpen } =
        useStore();

    const [userNotes, setUserNotes] = useState("");
    const [totalPrice, setTotalPrice] = useState("0.00");

    const [pdfLoading, setPdfLoading] = useState(false);

    useEffect(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
        setTotalPrice(subtotal.toFixed(2));
    }, [cartItems]);

    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);
    function buildSideSnapshot(item, side) {
        const s = item?.sides?.[side] || {};
        const designURL = item?.design?.[side]?.downloadURL || null;

        const images = [];
        // Array-Uploads
        if (Array.isArray(s.uploadedGraphics)) {
            s.uploadedGraphics.forEach((g) => {
                const url = g?.downloadURL || g?.url || null;
                if (url)
                    images.push({
                        id: g.id || null,
                        url,
                        name: g.name || null,
                        type: "upload",
                        // ⬇️ NEU: mögliche Transforms aus deinem Konfigurator-Objekt mit übernehmen
                        x: g.x ?? g.position?.x ?? null,
                        y: g.y ?? g.position?.y ?? null,
                        scale: g.scale ?? g.s ?? 1,
                        rotation: g.rotation ?? g.r ?? 0,
                    });
            });
        }
        // Single-Upload
        if (s.uploadedGraphic?.downloadURL) {
            const g = s.uploadedGraphic;
            images.push({
                id: g.id || null,
                url: g.downloadURL,
                name: g.name || null,
                type: "upload",
                x: g.x ?? g.position?.x ?? null,
                y: g.y ?? g.position?.y ?? null,
                scale: g.scale ?? g.s ?? 1,
                rotation: g.rotation ?? g.r ?? 0,
            });
        }
        // Design-Preview
        if (designURL) images.push({ id: null, url: designURL, name: "designPreview", type: "design" });

        // Texte (du hast hier schon alle Transforms drin – passt)
        const texts = Array.isArray(s.texts)
            ? s.texts.map((t) => ({
                  id: t.id,
                  value: t.value,
                  fontFamily: t.fontFamily,
                  fontSize: t.fontSize,
                  fill: t.fill,
                  rotation: t.rotation,
                  scale: t.scale,
                  x: t.x,
                  y: t.y,
                  letterSpacing: t.letterSpacing,
                  lineHeight: t.lineHeight,
              }))
            : [];

        return { images, texts };
    }

    // ⬇️ NEU: Rich-Snapshot eines Cart-Items für Firestore
    function buildItemSnapshot(srcItem, lineItemForThis) {
        const layoutInfo = srcItem?.layout
            ? {
                  instructions: srcItem.layout.instructions || null,
                  // *nur* URL/Name mitgeben – NIEMALS das File-Objekt
                  uploadedFileUrl: srcItem.layout.uploadedFile?.downloadURL || null,
                  uploadedFileName: srcItem.layout.uploadedFile?.name || null,
              }
            : null;

        return {
            productHandle: srcItem?.product?.handle || null,
            productTitle: srcItem?.productName || srcItem?.product?.title || null,
            selectedColor: srcItem?.selectedColor || null,
            selectedSize: srcItem?.selectedSize || null,
            totalPrice: Number(srcItem?.totalPrice || 0),

            variants: srcItem?.variants
                ? Object.entries(srcItem.variants).reduce((acc, [k, v]) => {
                      acc[k] = {
                          id: v?.id || null,
                          quantity: Number(v?.quantity ?? 0),
                          price: Number(v?.price ?? 0),
                      };
                      return acc;
                  }, {})
                : {},

            sides: {
                front: buildSideSnapshot(srcItem, "front"),
                back: buildSideSnapshot(srcItem, "back"),
            },

            lineItemConfig: lineItemForThis?.customAttributes || null,
            personalisierungsText: srcItem?.personalisierungsText || null,

            // ⬇️ sicherer Layout-Block (keine Files)
            layout: layoutInfo,
        };
    }

    // ⬇️ NEU: erzeugt die Pending-Items 1:1 aus cartItems + den Shopify lineItems (gleiche Reihenfolge)
    function buildItemsForPending(cartItems, lineItems) {
        // Wir ordnen über itemIndex (falls im Attribut vorhanden), sonst über Reihenfolge
        return cartItems.map((src, idx) => {
            const li =
                lineItems.find((li) =>
                    (li.customAttributes || []).some((a) => a.key === "itemIndex" && Number(a.value) === idx)
                ) ||
                lineItems[idx] ||
                null;
            return {
                variantId: li?.variantId || li?.merchandiseId || null,
                quantity: Number(li?.quantity || 0),
                config: li?.customAttributes || li?.attributes || null,
                snapshot: buildItemSnapshot(src, li),
            };
        });
    }

    function getAnonId() {
        if (typeof window === "undefined") return null;
        let v = localStorage.getItem("anonId");
        if (!v) {
            v = Math.random().toString(36).slice(2) + Date.now().toString(36);
            localStorage.setItem("anonId", v);
        }
        return v;
    }

    // sammelt mögliche Upload-IDs aus den Cart-Items
    function collectUploadIds(items) {
        const ids = [];
        for (const it of items) {
            if (it.uploadId) ids.push(it.uploadId);
            if (it.design?.front?.id) ids.push(it.design.front.id);
            if (it.design?.back?.id) ids.push(it.design.back.id);
            if (it.design?.front?.uploadId) ids.push(it.design.front.uploadId);
            if (it.design?.back?.uploadId) ids.push(it.design.back.uploadId);
        }
        return Array.from(new Set(ids)).slice(0, 25);
    }

    // baut ein schlankes Pending-Item-Array aus deinen lineItems
    function compactItemsForPending(lineItems) {
        return lineItems.map((li) => ({
            variantId: li.variantId || li.merchandiseId,
            quantity: Number(li.quantity || 0),
            // falls du Custom-Attributes/Config mitschickst:
            config: li.customAttributes || li.attributes || null,
        }));
    }

    // stabile ID per Mini-Hash (für Bilder/Textkombis)
    function hash(s) {
        let h = 0,
            i,
            chr;
        if (!s) return "0";
        for (i = 0; i < s.length; i++) {
            chr = s.charCodeAt(i);
            h = (h << 5) - h + chr;
            h |= 0;
        }
        return String(h);
    }

    // zieht aus den Items (mit snapshot) alle Bilder/Texte für die Library
    function collectAssetsFromPendingItems(items) {
        const imagesMap = new Map(); // per URL deduplizieren
        const textsMap = new Map(); // per (value|font|size|fill) deduplizieren
        const now = new Date();

        (items || []).forEach((it) => {
            const snap = it?.snapshot || {};
            const title = snap?.productTitle || "Artikel";

            ["front", "back"].forEach((side) => {
                const st = snap?.sides?.[side] || {};
                // Upload-Bilder
                (st.images || [])
                    .filter((img) => img?.type === "upload" && img?.url)
                    .forEach((img) => {
                        const id = "img_" + hash(img.url);
                        if (!imagesMap.has(id)) {
                            imagesMap.set(id, {
                                id,
                                kind: "image",
                                side,
                                url: img.url,
                                placement: {
                                    x: img.x ?? 300,
                                    y: img.y ?? 200,
                                    scale: img.scale ?? 1,
                                    rotation: img.rotation ?? 0,
                                },
                                productTitle: title,
                                lastUsedAt: now,
                            });
                        }
                    });

                // Texte
                (st.texts || []).forEach((t) => {
                    const sig = [t.value, t.fontFamily, t.fontSize, t.fill].join("|");
                    const id = "txt_" + hash(sig);
                    if (!textsMap.has(id)) {
                        textsMap.set(id, {
                            id,
                            kind: "text",
                            side,
                            value: t.value,
                            fontFamily: t.fontFamily,
                            fontSize: t.fontSize,
                            fill: t.fill,
                            letterSpacing: t.letterSpacing ?? null,
                            lineHeight: t.lineHeight ?? null,
                            placement: {
                                x: t.x ?? 300,
                                y: t.y ?? 200,
                                scale: t.scale ?? 1,
                                rotation: t.rotation ?? 0,
                            },
                            productTitle: title,
                            lastUsedAt: now,
                        });
                    }
                });
            });
        });

        return {
            images: Array.from(imagesMap.values()),
            texts: Array.from(textsMap.values()),
        };
    }
    const handleCheckout = async () => {
        try {
            const lineItems = prepareLineItems(cartItems);
            const uploads = collectUploadIds(cartItems);
            const uid = auth.currentUser?.uid || null;
            const anonId = uid ? null : getAnonId();

            const itemsForPending = buildItemsForPending(cartItems, lineItems);

            const { pendingId, scope, ownerId } = await createPendingOrder({
                items: itemsForPending,
                uploads,
                address: null,
                note: userNotes || null,
                extra: { userType: "firmenkunde" },
                context: { uid, anonId },
            });

            // ⬇️ N E U  –  Library updaten (nur wenn eingeloggt)
            if (uid) {
                const { images, texts } = collectAssetsFromPendingItems(itemsForPending);
                // orderId anreichern (praktisch für spätere Referenz)
                const toSave = [...images, ...texts].map((a) => ({ ...a, orderId: pendingId }));
                // bewusst seriell/Promise.all – wenige Writes pro Checkout
                await Promise.all(toSave.map((asset) => upsertLibraryAsset(uid, asset)));
            }

            const cartAttributes = [
                { key: "pendingId", value: pendingId },
                { key: "portalType", value: scope },
                { key: scope === "auth" ? "portalUid" : "anonId", value: ownerId },
                { key: "uploadIds", value: JSON.stringify(uploads) },
            ];

            const checkoutUrl = await createCart(lineItems, cartAttributes, userNotes);
            if (!checkoutUrl) throw new Error("Checkout URL missing");

            const dev = [process.env.NEXT_PUBLIC_DEV, process.env.NEXT_DEV].some((v) => v === "1" || v === "true");
            if (dev) {
                console.log("DEV MODE – checkoutUrl:", checkoutUrl);
                return;
            }
            window.location.href = checkoutUrl;
        } catch (err) {
            console.error("❌ handleCheckout failed:", err);
            setModalContent("Fehler beim Erstellen des Warenkorbs:\n" + (err.message || String(err)));
            setModalOpen(true);
        }
    };

    function closeSideBar() {
        console.log("BUBUBUBU");
        closeCartSidebar();
    }

    async function handleDownloadPdf() {
        try {
            setPdfLoading(true);
            const { pdf } = await import("@react-pdf/renderer"); // lazy-load lib
            const { default: CartOfferPDF } = await import("@/components/pdf/cartOfferPDF"); // lazy-load component

            const doc = <CartOfferPDF cartItems={cartItems} totalPrice={totalPrice} userNotes={userNotes} />;
            const blob = await pdf(doc).toBlob();

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Angebot_${new Date().toISOString().slice(0, 10)}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setPdfLoading(false);
        }
    }

    console.log(cartItems);

    return (
        <AnimatePresence>
            {isCartSidebarOpen && (
                <>
                    <Overlay onClose={closeCartSidebar} />
                    <motion.div
                        className="fixed top-0 right-0 h-full lg:w-1/3 bg-white shadow-lg z-50 flex flex-col p-4 lg:px-12 lg:py-12"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 400, damping: 20, duration: 0.2 }}
                    >
                        <button onClick={() => closeCartSidebar()} className="self-end mb-6">
                            <FiX className="text-3xl" />
                        </button>

                        <div className="flex-1 overflow-y-auto font-body">
                            {cartItems.length > 0 ? (
                                cartItems.map((item, index) => {
                                    // do we have per-size variants?
                                    const hasVariants = item.variants && Object.keys(item.variants).length > 0;

                                    // build quantity string
                                    let qtyDisplay;
                                    if (hasVariants) {
                                        const parts = Object.entries(item.variants)
                                            .filter(([, det]) => det.quantity > 0)
                                            .map(([size, det]) => `${det.quantity}x (${size})`);
                                        qtyDisplay = parts.length ? parts.join(", ") : "0";
                                    } else if (item.selectedSize) {
                                        qtyDisplay = `${item.quantity || 0}x (${item.selectedSize})`;
                                    } else {
                                        qtyDisplay = item.quantity != null ? item.quantity : "0";
                                    }

                                    return (
                                        <div key={item.id} className="flex items-start mb-8">
                                            {/* Vorschaubild */}
                                            <Link
                                                onClick={closeSideBar}
                                                href={`/products/${item.product.handle}?editIndex=${index}`}
                                                prefetch={false}
                                            >
                                                <img
                                                    src={
                                                        item.tryout
                                                            ? item.cartImage
                                                            : item.design?.front?.downloadURL ||
                                                              item.design?.back?.downloadURL ||
                                                              item.selectedImage ||
                                                              item.product?.images?.edges?.[0]?.node.originalSrc ||
                                                              ""
                                                    }
                                                    alt={item.productName}
                                                    className="w-16 mr-4 rounded"
                                                />
                                            </Link>

                                            <div className="flex-1">
                                                <H5 klasse="!mb-2">{item.productName}</H5>

                                                {/* 1) Size-Badges */}
                                                {item.variants && (
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            <span className="px-2 py-1  text-primaryColor font-bold text-xs rounded-full">
                                                                Varianten:
                                                            </span>
                                                            {Object.entries(item.variants)
                                                                .filter(
                                                                    ([variantName, det]) =>
                                                                        det.quantity > 0 &&
                                                                        variantName !== "frontVeredelung" &&
                                                                        variantName !== "backVeredelung"
                                                                )
                                                                .map(([size, det]) => (
                                                                    <span
                                                                        key={size}
                                                                        className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                                                                    >
                                                                        {det.quantity}× {size}
                                                                    </span>
                                                                ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 2) Veredelungs-Badges */}
                                                {item.variants &&
                                                    (() => {
                                                        const vd = [];
                                                        if (item.variants.frontVeredelung?.quantity > 0) {
                                                            vd.push(`${item.variants.frontVeredelung.quantity}× Front`);
                                                        }
                                                        if (item.variants.backVeredelung?.quantity > 0) {
                                                            vd.push(`${item.variants.backVeredelung.quantity}× Rücken`);
                                                        }
                                                        if (vd.length === 0) return null;
                                                        return (
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                <span className="px-2 py-1  text-primaryColor font-bold text-xs rounded-full">
                                                                    Veredelungen:
                                                                </span>
                                                                {vd.map((text, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                                                                    >
                                                                        {text}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}

                                                {/* 3) Einzelpreis */}
                                                <p className="text-sm font-semibold">
                                                    Preis: €{Number(item.totalPrice).toFixed(2)}
                                                </p>
                                            </div>

                                            {/* EDIT-Icon */}
                                            <Link
                                                onClick={closeSideBar}
                                                href={`/products/${item.product.handle}?editIndex=${index}`}
                                                prefetch={false}
                                                className="ml-4 text-gray-600 hover:text-gray-800"
                                            >
                                                <FiEdit2 className="text-xl" />
                                            </Link>

                                            {/* Mülleimer */}
                                            <button
                                                onClick={() => removeCartItem(item.id)}
                                                className="text-red-500 hover:text-red-700 ml-4"
                                            >
                                                <FiTrash2 className="text-lg" />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <P>Ihr Einkaufswagen ist leer.</P>
                            )}
                        </div>

                        {cartItems.length > 0 ? (
                            <button
                                onClick={handleDownloadPdf}
                                disabled={pdfLoading}
                                className="w-full font-body font-semibold mt-2 border flex items-center justify-center border-gray-300 text-gray-800 py-3 rounded-lg text-center"
                            >
                                <FiFileText />{" "}
                                {pdfLoading ? (
                                    <div className="ml-4">PDF wird erstellt …</div>
                                ) : (
                                    <div className="ml-4">Angebot als PDF herunterladen</div>
                                )}
                            </button>
                        ) : null}

                        {/* User notes */}
                        <div className="my-4 bg-[#f3f4f6] ">
                            <P klasse="mb-2 font-semibold !tracking-wider px-4 py-2">Besondere Anmerkungen:</P>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Ihre Anmerkungen..."
                                value={userNotes}
                                onChange={(e) => setUserNotes(e.target.value)}
                                variant="outlined"
                                className="font-body"
                            />
                        </div>

                        {/* Total & Checkout */}
                        <div className="mt-4 mb-6">
                            <H3 klasse="!mb-2">Gesamtsumme: €{totalPrice}</H3>
                        </div>

                        {/* … nach der Gesamtsumme, vor dem Checkout-Button */}
                        <div className="mt-2 mb-4 text-center">
                            <Link href="/shop" onClick={closeSideBar} prefetch={false}>
                                <button className="text-sm font-semibold text-textColor hover:underline">
                                    ← Weiter einkaufen
                                </button>
                            </Link>
                        </div>
                        {cartItems.length > 0 && (
                            <button
                                onClick={handleCheckout}
                                className="w-full mt-6 bg-primaryColor font-bold text-white py-3 rounded-lg"
                            >
                                ZUR KASSE
                            </button>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
