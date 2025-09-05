"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    FiHome,
    FiShoppingBag,
    FiUploadCloud,
    FiFileText,
    FiMapPin,
    FiLogOut,
    FiSearch,
    FiPlus,
    FiTrash2,
    FiRefreshCw,
    FiDownload,
    FiX,
} from "react-icons/fi";

// ---- Firebase (client-safe modular) ----
import { auth } from "@/config/firebase";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore";

// ---- Shopify fetcher ----
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

async function callShopify(queryStr, variables = {}) {
    const url = `https://${domain}/api/2023-01/graphql.json`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "X-Shopify-Storefront-Access-Token": token,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: queryStr, variables }),
    });
    const json = await res.json();
    if (json.errors) console.error("Shopify errors:", json.errors);
    return json.data;
}

// Pagination-fähige Produktsuche (für Infinite Scroll)
async function searchProductsPage({ queryTerm = "", after = null, pageSize = 24 }) {
    const qStr = queryTerm ? `${queryTerm}` : undefined;

    const gql = `
    query ProductsSearch($q: String, $after: String, $first: Int!) {
      products(first: $first, after: $after, query: $q) {
        edges {
          cursor
          node {
            id
            title
            handle
            description
            productType
            tags
            featuredImage { url altText }
            images(first: 4) { edges { node { url altText } } }
            variants(first: 50) {
              edges { node { id title price { amount currencyCode } availableForSale } }
            }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  `;
    const data = await callShopify(gql, { q: qStr, after, first: pageSize });
    const conn = data?.products;
    const items = (conn?.edges || []).map((e) => e.node);

    return { items, endCursor: conn?.pageInfo?.endCursor || null, hasNextPage: !!conn?.pageInfo?.hasNextPage };
}

// ---- Helpers ----
const currency = (n) => `€${Number(n || 0).toFixed(2)}`;
const toNumber = (v, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);

// ---- MwSt. / B2B ----
const VAT_RATE = 0.19;

// Staffelpreise Veredelung
function decorationUnitPrice(qty) {
    if (qty >= 100) return 3.9;
    if (qty >= 50) return 4.5;
    if (qty >= 20) return 5.5;
    if (qty >= 1) return 6.5;
    return 0;
}

// ---- Produkt-Zulassung: nur Textil + UV-Druck, keine Geschenke ----
// const ALLOWED_TYPES = ["workwear", "streetwear", "sportswear"];
// const ALLOWED_TAGS = ["uv", "uvdruck", "uv_druck", "uv-druck", "uv print", "uv-print"];
// const BLOCKED_HINTS = ["gift", "geschenk", "geschenke", "present"];

// function isAllowedProduct(p) {
//     const s = (x) => (x || "").toLowerCase();
//     const type = s(p.productType),
//         handle = s(p.handle),
//         title = s(p.title);
//     const tags = (p.tags || []).map(s);
//     const looksGift = ["gift", "geschenk", "geschenke", "present"].some(
//         (k) => type.includes(k) || handle.includes(k) || title.includes(k) || tags.some((t) => t.includes(k))
//     );
//     return !looksGift; // <- nur Geschenke raus
// }

// ---- Shared UI bits ----
function NavIcon({ href, icon, active }) {
    return (
        <Link
            href={href}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                active ? "bg-black text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
        >
            <span className="sr-only">Nav</span>
            {icon}
        </Link>
    );
}
const SectionTitle = ({ children }) => (
    <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{children}</div>
);

// ---- Linke Spalte: Produktauswahl (nur Suche, Scroll lädt nach) ----
function ProduktListe({ onPick }) {
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");
    const [results, setResults] = useState([]);
    const [after, setAfter] = useState(null);
    const [hasNext, setHasNext] = useState(false);

    const scrollRef = useRef(null);
    const loadingMoreRef = useRef(false);

    const load = async ({ reset = false } = {}) => {
        if (loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoading(true);
        try {
            const page = await searchProductsPage({
                queryTerm: q,
                after: reset ? null : after,
                pageSize: 24,
            });
            // const pageFiltered = page.items.filter(isAllowedProduct);
            setResults((prev) => (reset ? page.items : [...prev, ...page.items])); // ✅ alle Produkte
            setAfter(page.endCursor);
            setHasNext(page.hasNextPage);
        } finally {
            setLoading(false);
            loadingMoreRef.current = false;
        }
    };

    // initial
    useEffect(() => {
        load({ reset: true });
    }, []);
    // Suche anwenden
    const applySearch = () => load({ reset: true });

    // Infinite Scroll: wenn nahe unten, nächste Seite laden
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onScroll = () => {
            const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 120;
            if (nearBottom && hasNext && !loading) {
                load({ reset: false });
            }
        };
        el.addEventListener("scroll", onScroll);
        return () => el.removeEventListener("scroll", onScroll);
    }, [hasNext, loading, after, q]);

    return (
        <div className="rounded-3xl bg-white p-4 shadow-sm border flex flex-col max-h-[78vh]">
            <SectionTitle>Produkt wählen</SectionTitle>

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Produkt suchen…"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                </div>
                <button onClick={applySearch} className="rounded-xl border px-3 py-2 inline-flex items-center gap-2">
                    <FiRefreshCw /> Suchen
                </button>
            </div>

            <div ref={scrollRef} className="mt-3 flex-1 overflow-auto">
                {loading && results.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">Lade…</div>
                ) : results.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">Keine passenden Produkte.</div>
                ) : (
                    <ul className="space-y-2">
                        {results.map((p) => {
                            const img = p.featuredImage?.url || p.images?.edges?.[0]?.node?.url || "/placeholder.png";
                            return (
                                <li key={p.id}>
                                    <button
                                        onClick={() => onPick(p)}
                                        className="w-full flex items-center gap-3 rounded-2xl border hover:border-gray-400 transition bg-white p-2"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={img}
                                            alt={p.title}
                                            className="w-14 h-14 rounded-xl object-contain bg-gray-50"
                                        />
                                        <div className="text-left">
                                            <div className="font-medium leading-tight">{p.title}</div>
                                            <div className="text-xs text-gray-500">{p.productType || p.handle}</div>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
                {loading && results.length > 0 && (
                    <div className="py-3 text-center text-xs text-gray-400">Mehr wird geladen…</div>
                )}
            </div>

            <div className="pt-3">
                <button
                    onClick={() => onPick(null)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2"
                >
                    <FiPlus /> Neues Produkt wählen
                </button>
            </div>
        </div>
    );
}

// ---- Rechte Spalte: Varianten ----
function VariantMatrix({ product, onChangeTotalQty, onChangeRows }) {
    const [rows, setRows] = useState({});

    useEffect(() => {
        if (!product) {
            setRows({});
            onChangeRows({});
            onChangeTotalQty(0);
            return;
        }
        const next = {};
        (product.variants?.edges || []).forEach(({ node }) => {
            next[node.id] = { title: node.title, price: toNumber(node.price?.amount), qty: 0 };
        });
        setRows(next);
        onChangeRows(next);
        onChangeTotalQty(0);
    }, [product]);

    useEffect(() => {
        const totalQty = Object.values(rows).reduce((s, r) => s + toNumber(r.qty), 0);
        onChangeTotalQty(totalQty);
    }, [rows]);

    const list = Object.entries(rows);
    const variantsSum = list.reduce((s, [, r]) => s + toNumber(r.qty) * toNumber(r.price), 0);

    if (!product) {
        return (
            <div className="rounded-3xl bg-white p-4 shadow-sm border min-h-[240px] flex items-center justify-center text-gray-400">
                Bitte links ein Produkt wählen.
            </div>
        );
    }

    return (
        <div className="rounded-3xl bg-white p-4 shadow-sm border">
            <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={product.featuredImage?.url || product.images?.edges?.[0]?.node?.url || "/placeholder.png"}
                    alt={product.title}
                    className="w-20 h-20 object-contain bg-gray-50 rounded-xl"
                />
                <div>
                    <div className="font-semibold">{product.title}</div>
                    <div className="text-xs opacity-60">{product.handle}</div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {list.map(([id, r]) => (
                    <div key={id} className="border rounded-xl p-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="font-medium">{r.title}</div>
                            <div className="text-sm opacity-70">{currency(r.price)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                value={r.qty}
                                onChange={(e) =>
                                    setRows((prev) => {
                                        const qty = toNumber(e.target.value);
                                        const next = { ...prev, [id]: { ...prev[id], qty } };
                                        onChangeRows(next);
                                        return next;
                                    })
                                }
                                className="w-28 px-3 py-2 rounded-lg border border-gray-200"
                            />
                            <span className="opacity-60 text-sm">Stück</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 text-sm opacity-70">
                Zwischensumme Varianten: <b>{currency(variantsSum)}</b>
            </div>
        </div>
    );
}

// ---- Veredelungen (nur Menge, Preis automatisch aus Staffel) ----
function Veredelungen({ onChange }) {
    const [items, setItems] = useState([
        { id: "front", title: "Veredelung Front", qty: 0 },
        { id: "back", title: "Veredelung Rücken", qty: 0 },
    ]);

    const computed = useMemo(() => {
        return items.map((it) => {
            const unit = decorationUnitPrice(toNumber(it.qty));
            const sum = unit * toNumber(it.qty);
            return { ...it, unit, sum };
        });
    }, [items]);

    const subtotal = computed.reduce((s, it) => s + it.sum, 0);

    useEffect(() => {
        onChange(computed);
    }, [computed]);

    const update = (id, qty) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty } : it)));
    const add = () =>
        setItems((prev) => [...prev, { id: Math.random().toString(36).slice(2), title: "Veredelung", qty: 0 }]);
    const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

    return (
        <div className="rounded-3xl bg-white p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Veredelungen</div>
                <button onClick={add} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border">
                    <FiPlus /> Zeile
                </button>
            </div>

            <div className="space-y-3">
                {computed.map((it) => (
                    <div
                        key={it.id}
                        className="grid grid-cols-1 md:grid-cols-[1fr,120px,1fr,44px] gap-2 border rounded-xl p-3"
                    >
                        <input
                            value={it.title}
                            onChange={(e) =>
                                setItems((prev) =>
                                    prev.map((x) => (x.id === it.id ? { ...x, title: e.target.value } : x))
                                )
                            }
                            className="px-3 py-2 rounded-lg border border-gray-200"
                            placeholder="Titel"
                        />
                        <input
                            type="number"
                            min="0"
                            value={it.qty}
                            onChange={(e) => update(it.id, toNumber(e.target.value))}
                            className="px-3 py-2 rounded-lg border border-gray-200"
                            placeholder="Menge"
                            title="Anzahl Teile, die auf dieser Seite veredelt werden"
                        />
                        <div className="flex items-center justify-between text-sm">
                            <div className="opacity-70">
                                Einzelpreis: <b>{currency(it.unit)}</b>
                            </div>
                            <div className="opacity-70">
                                Summe: <b>{currency(it.sum)}</b>
                            </div>
                        </div>
                        <button onClick={() => remove(it.id)} className="p-2 rounded-lg border">
                            <FiTrash2 />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-3 text-sm opacity-70">
                Zwischensumme Veredelungen: <b>{currency(subtotal)}</b>
            </div>
            <div className="mt-1 text-xs text-gray-500">
                Staffel: 1–19 €6.50 · 20–49 €5.50 · 50–99 €4.50 · ≥100 €3.90
            </div>
        </div>
    );
}

// ---- Summary inkl. VAT-Breakdown ----
function OfferSummary({ offerItems, onRemove, notes, onNotes, onSave, onDownload, forwardedRef }) {
    const net = offerItems.reduce((s, it) => s + it.totalPrice, 0);
    const vatHypo = net * VAT_RATE;
    const grossHypo = net + vatHypo;

    return (
        <div ref={forwardedRef} className="rounded-3xl bg-white p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Angebot – Positionen</div>
                <div className="text-sm opacity-70">
                    Summe (Netto): <b>{currency(net)}</b>
                </div>
            </div>

            {offerItems.length === 0 ? (
                <div className="opacity-60 py-6 text-sm">Noch keine Positionen hinzugefügt.</div>
            ) : (
                <div className="space-y-3">
                    {offerItems.map((it) => (
                        <div key={it.key} className="border rounded-xl p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="font-medium">{it.productName}</div>
                                    <div className="text-xs opacity-60">{it.productHandle}</div>
                                </div>
                                <button onClick={() => onRemove(it.key)} className="p-2 rounded-lg border">
                                    <FiX />
                                </button>
                            </div>

                            <div className="mt-2 text-sm">
                                {(it.variantRows || []).map((r) => (
                                    <div key={r.key} className="flex items-center justify-between">
                                        <div className="opacity-80">{r.title}</div>
                                        <div className="opacity-60">
                                            {r.qty} × {currency(r.unit)} = <b>{currency(r.qty * r.unit)}</b>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-2 text-sm">
                                {(it.refinements || []).map((r) => (
                                    <div key={r.key} className="flex items-center justify-between">
                                        <div className="opacity-80">{r.title}</div>
                                        <div className="opacity-60">
                                            {r.qty} × {currency(r.unit)} = <b>{currency(r.qty * r.unit)}</b>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-2 text-right text-sm">
                                Positionssumme: <b>{currency(it.totalPrice)}</b>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* B2B/VAT Breakdown */}
            <div className="mt-4 grid gap-1 text-sm">
                <div className="flex items-center justify-between">
                    <span>Summe netto (B2B):</span>
                    <b>{currency(net)}</b>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                    <span>USt. {Math.round(VAT_RATE * 100)}% (hypothetisch, Privatkunde):</span>
                    <span>{currency(vatHypo)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                    <span>Brutto (hypothetisch, Privatkunde):</span>
                    <span>{currency(grossHypo)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-emerald-700">USt.-Ersparnis (B2B):</span>
                    <b className="text-emerald-700">−{currency(vatHypo)}</b>
                </div>
            </div>

            <div className="mt-3">
                <textarea
                    value={notes}
                    onChange={(e) => onNotes(e.target.value)}
                    placeholder="Anmerkungen fürs Angebot…"
                    className="w-full min-h-[90px] px-3 py-2 rounded-xl border border-gray-200"
                />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                    onClick={onSave}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white"
                >
                    <FiFileText /> Angebot speichern
                </button>
                <button onClick={onDownload} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border">
                    <FiDownload /> PDF exportieren
                </button>
            </div>
        </div>
    );
}

// ---- Archiv ----
function Archiv({ items, onReload, onDelete }) {
    return (
        <div className="rounded-3xl bg-white p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Archivierte Angebote</div>
                <button onClick={onReload} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border">
                    <FiRefreshCw /> Aktualisieren
                </button>
            </div>

            {items.length === 0 ? (
                <div className="opacity-60 py-6 text-sm">Noch keine gespeicherten Angebote.</div>
            ) : (
                <div className="space-y-3">
                    {items.map((o) => (
                        <div key={o._id} className="border rounded-xl p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">
                                        Angebot vom {new Date(o.createdAt).toLocaleString()}
                                    </div>
                                    <div className="text-sm opacity-70">
                                        Positionen: {o.items?.length ?? 0} · Summe netto: <b>{currency(o.total)}</b>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`data:application/json;charset=utf-8,${encodeURIComponent(
                                            JSON.stringify(o, null, 2)
                                        )}`}
                                        download={`Angebot_${new Date(o.createdAt).toISOString().slice(0, 10)}.json`}
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border"
                                    >
                                        JSON
                                    </a>
                                    <button onClick={() => onDelete(o._id)} className="p-2 rounded-lg border">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                            {o.notes ? <div className="mt-2 text-sm opacity-80">Notiz: {o.notes}</div> : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ===================== Hauptseite =====================
export default function DashboardAngebot() {
    const [user, setUser] = useState(null);
    const [selected, setSelected] = useState(null);
    const [variantRows, setVariantRows] = useState({});
    const [refinements, setRefinements] = useState([]);
    const [offerItems, setOfferItems] = useState([]);
    const [notes, setNotes] = useState("");
    const [archive, setArchive] = useState([]);

    const summaryRef = useRef(null);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((u) => setUser(u));
        return () => unsub();
    }, []);

    const addPosition = () => {
        if (!selected) return;

        const variantList = Object.entries(variantRows)
            .filter(([, r]) => toNumber(r.qty) > 0)
            .map(([id, r]) => ({
                key: `v-${id}`,
                variantId: id,
                title: r.title,
                qty: toNumber(r.qty),
                unit: toNumber(r.price),
            }));

        const refinementsList = (refinements || [])
            .filter((r) => toNumber(r.qty) > 0)
            .map((r) => ({
                key: `r-${r.id || r.title}`,
                title: r.title,
                qty: toNumber(r.qty),
                unit: toNumber(r.unit),
            }));

        const sum =
            variantList.reduce((s, r) => s + r.qty * r.unit, 0) +
            refinementsList.reduce((s, r) => s + r.qty * r.unit, 0);

        const img = selected.featuredImage?.url || selected.images?.edges?.[0]?.node?.url || "";

        setOfferItems((prev) => [
            ...prev,
            {
                key: Math.random().toString(36).slice(2),
                productId: selected.id,
                productHandle: selected.handle,
                productName: selected.title,
                productImage: img,
                variantRows: variantList,
                refinements: refinementsList,
                totalPrice: sum,
            },
        ]);

        setSelected(null);
        setVariantRows({});
        setRefinements([]);

        setTimeout(() => {
            if (summaryRef.current) summaryRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
    };

    const removePosition = (key) => setOfferItems((prev) => prev.filter((p) => p.key !== key));
    const netTotal = offerItems.reduce((s, it) => s + it.totalPrice, 0);

    async function handleDownloadPdf() {
        const { pdf } = await import("@react-pdf/renderer");
        const { default: CartOfferPDF } = await import("@/components/pdf/cartOfferPDF");
        const doc = (
            <CartOfferPDF
                cartItems={offerItems.map((it) => ({
                    id: it.key,
                    productName: it.productName,
                    product: {
                        productName: it.productName,
                        images: { edges: [{ node: { originalSrc: it.productImage } }] },
                    },
                    // Varianten
                    variants: Object.fromEntries(
                        (it.variantRows || []).map((r) => [r.title, { quantity: r.qty, price: r.unit }])
                    ),
                    // ✅ Veredelungen (neu)
                    refinements: (it.refinements || []).map((r) => ({
                        title: r.title,
                        quantity: r.qty,
                        price: r.unit,
                    })),
                    totalPrice: it.totalPrice,
                    design: { front: { downloadURL: it.productImage } },
                }))}
                totalPrice={netTotal}
                userNotes={notes}
                vatRate={VAT_RATE}
                b2bMode={true}
            />
        );
        const blob = await pdf(doc).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Angebot_${new Date().toISOString().slice(0, 10)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Firestore
    const fs = getFirestore();
    async function saveOffer() {
        if (!user) {
            alert("Bitte einloggen, um Angebote zu speichern.");
            return;
        }
        const payload = {
            userId: user.uid,
            items: offerItems,
            total: netTotal,
            notes,
            createdAt: Date.now(),
            createdAtServer: serverTimestamp(),
        };
        await addDoc(collection(fs, "offers", user.uid, "list"), payload);
        await loadArchive();
    }
    async function loadArchive() {
        if (!user) return;
        const qRef = query(collection(fs, "offers", user.uid, "list"), orderBy("createdAtServer", "desc"));
        const snap = await getDocs(qRef);
        const arr = [];
        snap.forEach((d) => arr.push({ _id: d.id, ...d.data(), createdAt: d.data().createdAt || Date.now() }));
        setArchive(arr);
    }
    useEffect(() => {
        if (user) loadArchive();
    }, [user]);

    return (
        <div className="min-h-screen font-body bg-[#f8f7f5]">
            <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
                <div className="flex gap-6">
                    {/* Sidebar */}
                    <aside className="hidden md:flex w-16 flex-col items-center gap-4 rounded-2xl bg-white py-6 shadow-sm border">
                        <div className="h-10 w-10 rounded-full bg-gray-100" />
                        <NavIcon href="/dashboard" icon={<FiHome />} />
                        <NavIcon href="/dashboard/orders" icon={<FiShoppingBag />} />
                        <NavIcon href="/dashboard/uploads" icon={<FiUploadCloud />} />
                        <NavIcon href="/dashboard/angebot" icon={<FiFileText />} active />
                        <NavIcon href="/dashboard/profile" icon={<FiMapPin />} />
                        <button
                            onClick={() => auth.signOut()}
                            className="mt-auto text-gray-400 hover:text-gray-700"
                            aria-label="Logout"
                            title="Logout"
                        >
                            <FiLogOut size={20} />
                        </button>
                    </aside>

                    {/* Main */}
                    <main className="flex-1">
                        <div className="rounded-3xl bg-white px-6 py-8 shadow-sm border">
                            <p className="text-sm text-gray-500">Angebotsassistent</p>
                            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                                <span className="text-gray-900">Angebot erstellen</span>
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Produkt wählen, Varianten staffeln, Veredelungen hinzufügen.
                            </p>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-[380px,1fr]">
                            <ProduktListe onPick={setSelected} />

                            <div className="space-y-4">
                                <VariantMatrix
                                    product={selected}
                                    onChangeTotalQty={() => {}}
                                    onChangeRows={setVariantRows}
                                />
                                <Veredelungen onChange={setRefinements} />
                                <div className="flex justify-end">
                                    <button
                                        onClick={addPosition}
                                        disabled={!selected}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                                            selected
                                                ? "bg-black text-white"
                                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        }`}
                                    >
                                        <FiPlus /> Position zum Angebot hinzufügen
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <OfferSummary
                                offerItems={offerItems}
                                onRemove={removePosition}
                                notes={notes}
                                onNotes={setNotes}
                                onSave={saveOffer}
                                onDownload={handleDownloadPdf}
                                forwardedRef={summaryRef}
                            />
                        </div>

                        <div className="mt-6">
                            <Archiv
                                items={archive}
                                onReload={loadArchive}
                                onDelete={async (id) => {
                                    await deleteDoc(doc(fs, "offers", user.uid, "list", id));
                                    await loadArchive();
                                }}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
