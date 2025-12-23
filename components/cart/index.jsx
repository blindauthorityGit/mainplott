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

// kleine Helfer zum Zählen der Motive/Zusatzveredelungen
function countSideContent(sideObj) {
    const s = sideObj || {};
    const texts = Array.isArray(s.texts) ? s.texts.length : 0;
    const graphics = Array.isArray(s.uploadedGraphics) ? s.uploadedGraphics.length : 0;
    const total = texts + graphics;
    const extra = Math.max(0, total - 1); // 1 pro Seite inkl., Rest = Zusatz
    return { total, extra };
}
function getDecorationCounts(item) {
    const sides = item?.sides || {};
    const f = countSideContent(sides.front);
    const b = countSideContent(sides.back);
    // falls im Item bereits extraDecorations mitgeliefert wurde, nimm diese
    const stored = item?.extraDecorations;
    const frontExtra = typeof stored?.front === "number" ? stored.front : f.extra;
    const backExtra = typeof stored?.back === "number" ? stored.back : b.extra;
    return {
        frontTotal: f.total,
        backTotal: b.total,
        total: f.total + b.total,
        frontExtra,
        backExtra,
        extraTotal: frontExtra + backExtra,
    };
}

function getVariantLabel(variant) {
    if (!variant) return null;
    // 1) bevorzugt: Variant-Titel (so zeigt Shopify es auch)
    if (variant.title && !/Default Title/i.test(variant.title)) return variant.title;
    // 2) fallback: ausgewählte Optionen zusammenbauen
    if (Array.isArray(variant.selectedOptions) && variant.selectedOptions.length) {
        return variant.selectedOptions.map((o) => o.value).join(" / ");
    }
    return null;
}

export default function CartSidebar() {
    const { cartItems, isCartSidebarOpen, closeCartSidebar, removeCartItem, setModalContent, setModalOpen } =
        useStore();

    const [userNotes, setUserNotes] = useState("");
    const [totalPrice, setTotalPrice] = useState("0.00");
    const [pdfLoading, setPdfLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
        setTotalPrice(subtotal.toFixed(2));
    }, [cartItems]);

    useEffect(() => setIsClient(true), []);

    // ======= (alles unterhalb ist unverändert außer dem Render-Block des Items) =======

    function buildSideSnapshot(item, side) {
        const s = item?.sides?.[side] || {};
        const designURL = item?.design?.[side]?.downloadURL || null;

        const images = [];
        if (Array.isArray(s.uploadedGraphics)) {
            s.uploadedGraphics.forEach((g) => {
                const url = g?.downloadURL || g?.url || null;
                if (url)
                    images.push({
                        id: g.id || null,
                        url,
                        name: g.name || null,
                        type: "upload",
                        x: g.x ?? g.position?.x ?? null,
                        y: g.y ?? g.position?.y ?? null,
                        scale: g.scale ?? g.s ?? 1,
                        rotation: g.rotation ?? g.r ?? 0,
                    });
            });
        }
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
        if (designURL) images.push({ id: null, url: designURL, name: "designPreview", type: "design" });

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

    function buildItemSnapshot(srcItem, lineItemForThis) {
        const layoutInfo = srcItem?.layout
            ? {
                  instructions: srcItem.layout.instructions || null,
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
                      acc[k] = { id: v?.id || null, quantity: Number(v?.quantity ?? 0), price: Number(v?.price ?? 0) };
                      return acc;
                  }, {})
                : {},
            sides: {
                front: buildSideSnapshot(srcItem, "front"),
                back: buildSideSnapshot(srcItem, "back"),
            },
            lineItemConfig: lineItemForThis?.customAttributes || null,
            personalisierungsText: srcItem?.personalisierungsText || null,
            layout: layoutInfo,
        };
    }

    function buildItemsForPending(cartItems, lineItems) {
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

    function compactItemsForPending(lineItems) {
        return lineItems.map((li) => ({
            variantId: li.variantId || li.merchandiseId,
            quantity: Number(li.quantity || 0),
            config: li.customAttributes || li.attributes || null,
        }));
    }

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

    function collectAssetsFromPendingItems(items) {
        const imagesMap = new Map();
        const textsMap = new Map();
        const now = new Date();

        (items || []).forEach((it) => {
            const snap = it?.snapshot || {};
            const title = snap?.productTitle || "Artikel";

            ["front", "back"].forEach((side) => {
                const st = snap?.sides?.[side] || {};
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

        return { images: Array.from(imagesMap.values()), texts: Array.from(textsMap.values()) };
    }

    const EXTRA_UNIT = Number(process.env.NEXT_PUBLIC_EXTRA_DECORATION_PRICE || 3.5);

    const handleCheckout = async () => {
        try {
            const lineItems = prepareLineItems(cartItems);
            console.log("LINE", lineItems);
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

            if (uid) {
                const { images, texts } = collectAssetsFromPendingItems(itemsForPending);
                const toSave = [...images, ...texts].map((a) => ({ ...a, orderId: pendingId }));
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

    return (
        <AnimatePresence>
            {isCartSidebarOpen && (
                <>
                    <Overlay onClose={closeCartSidebar} />
                    <motion.div
                        className="fixed top-0 right-0 h-full lg:w-1/3 bg-white shadow-lg z-50 flex flex-col p-4 lg:px-10 lg:py-10"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 400, damping: 20, duration: 0.2 }}
                    >
                        <button onClick={closeCartSidebar} className="self-end mb-4">
                            <FiX className="text-3xl" />
                        </button>

                        <div className="flex-1 overflow-y-auto font-body">
                            {cartItems.length > 0 ? (
                                cartItems.map((item, index) => {
                                    const counts = getDecorationCounts(item);

                                    return (
                                        <div
                                            key={item.id}
                                            className="mb-4 rounded-2xl border border-gray-200/70 bg-white/90 shadow-sm p-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Bild */}
                                                <Link
                                                    onClick={closeCartSidebar}
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
                                                        className="w-16 h-16 object-contain rounded-xl border border-gray-200 bg-white"
                                                    />
                                                </Link>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <H5 klasse="!mb-1 truncate">{item.productName}</H5>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <Link
                                                                onClick={closeCartSidebar}
                                                                href={`/products/${item.product.handle}?editIndex=${index}`}
                                                                prefetch={false}
                                                                className="text-gray-600 hover:text-gray-800"
                                                                title="Bearbeiten"
                                                            >
                                                                <FiEdit2 className="text-lg" />
                                                            </Link>
                                                            <button
                                                                onClick={() => removeCartItem(item.id)}
                                                                className="text-red-500 hover:text-red-700"
                                                                title="Löschen"
                                                            >
                                                                <FiTrash2 className="text-lg" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Varianten (kompakte Chips) */}
                                                    {item.variants && (
                                                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                            <span className="px-2 py-0.5 text-[11px] font-semibold text-gray-700">
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
                                                                        className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[11px] border border-gray-200"
                                                                    >
                                                                        {det.quantity}× {size}
                                                                    </span>
                                                                ))}
                                                        </div>
                                                    )}

                                                    {/* Motive & Zusatzveredelungen */}
                                                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                                        <span className="px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                                                            Design:
                                                        </span>
                                                        {counts.frontTotal > 0 && (
                                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[11px] border border-gray-200">
                                                                Front {counts.frontTotal} Motiv
                                                                {counts.frontTotal > 1 ? "e" : ""}
                                                            </span>
                                                        )}
                                                        {counts.backTotal > 0 && (
                                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 text-[11px] border border-gray-200">
                                                                Rücken {counts.backTotal} Motiv
                                                                {counts.backTotal > 1 ? "e" : ""}
                                                            </span>
                                                        )}
                                                        {counts.extraTotal > 0 && (
                                                            <span className="px-2 py-0.5 rounded-full bg-[#fff7f7] text-[#9a1c1c] text-[11px] border border-[#f3d0d0]">
                                                                Zusatz {counts.extraTotal}
                                                                {/* {Number.isFinite(EXTRA_UNIT)
                                                                    ? ` × €${EXTRA_UNIT.toFixed(2)}`
                                                                    : ""} */}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Preis */}
                                                    <p className="text-sm font-semibold mt-1">
                                                        Preis: €{Number(item.totalPrice).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <P>Ihr Einkaufswagen ist leer.</P>
                            )}
                        </div>

                        {cartItems.length > 0 ? (
                            <button
                                onClick={async () => {
                                    try {
                                        setPdfLoading(true);
                                        const { pdf } = await import("@react-pdf/renderer");
                                        const { default: CartOfferPDF } = await import("@/components/pdf/cartOfferPDF");
                                        const doc = (
                                            <CartOfferPDF
                                                cartItems={cartItems}
                                                totalPrice={totalPrice}
                                                userNotes={userNotes}
                                            />
                                        );
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
                                }}
                                disabled={pdfLoading}
                                className="w-full font-body font-semibold mt-1 border flex items-center justify-center border-gray-300 text-gray-800 py-3 rounded-lg text-center"
                            >
                                <FiFileText />
                                <span className="ml-3">
                                    {pdfLoading ? "PDF wird erstellt …" : "Angebot als PDF herunterladen"}
                                </span>
                            </button>
                        ) : null}

                        {/* Notizen */}
                        <div className="my-4 bg-[#f3f4f6] rounded-xl border border-gray-200">
                            <P klasse="mb-2 font-semibold !tracking-wider px-4 pt-3">Besondere Anmerkungen:</P>
                            <div className="px-4 pb-4">
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    placeholder="Ihre Anmerkungen..."
                                    value={userNotes}
                                    onChange={(e) => setUserNotes(e.target.value)}
                                    variant="outlined"
                                    className="font-body bg-white rounded-md"
                                />
                            </div>
                        </div>

                        {/* Total & Checkout */}
                        <div className="mt-2 mb-4">
                            <H3 klasse="!mb-2">Gesamtsumme: €{totalPrice}</H3>
                            <div className="mt-1 text-center">
                                <Link href="/shop" onClick={closeCartSidebar} prefetch={false}>
                                    <button className="text-sm font-semibold text-textColor hover:underline">
                                        ← Weiter einkaufen
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {cartItems.length > 0 && (
                            <button
                                onClick={handleCheckout}
                                className="w-full mt-2 bg-primaryColor font-bold text-white py-3 rounded-lg"
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
