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

import Logo from "@/assets/logo.jpg";

// ---- Firebase (client-safe modular) ----
import { auth, fetchDashboardData } from "@/config/firebase";
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

const EXCLUDED_FROM_ALL = [
    "hochzeit",
    "geburt",
    "weihnachten",
    "kinder",
    "geschenkidee",
    "veredelung",
    "profidatencheck",
];

function isAllowedProduct(p) {
    const tags = (p.tags || []).map((t) => (t || "").toLowerCase());
    return !tags.some((t) => EXCLUDED_FROM_ALL.some((blocked) => t.includes(blocked)));
}

// ----- TIER-HELPERS (wie im Konfigurator) -----
function parseTiers(mf) {
    try {
        const raw = mf && mf.value ? JSON.parse(mf.value) : [];
        const arr = Array.isArray(raw) ? raw : Array.isArray(raw.discounts) ? raw.discounts : [];
        return arr
            .map((d) => ({ min: Number(d.minQuantity) || 0, price: Number(d.price) || 0 }))
            .filter((d) => d.price > 0)
            .sort((a, b) => a.min - b.min);
    } catch (e) {
        return [];
    }
}

function parseProductDiscounts(mf) {
    try {
        const raw = mf && mf.value ? JSON.parse(mf.value) : null;
        const list = Array.isArray(raw?.discounts) ? raw.discounts : Array.isArray(raw) ? raw : [];
        return list
            .map((d) => ({
                minQuantity: Number(d.minQuantity) || 0,
                maxQuantity: d.maxQuantity != null ? Number(d.maxQuantity) : null,
                discountSum: d.discountSum != null ? Number(d.discountSum) : 0,
                discountPercentage: d.discountPercentage != null ? Number(d.discountPercentage) : 0,
            }))
            .sort((a, b) => a.minQuantity - b.minQuantity);
    } catch (e) {
        return [];
    }
}

// Veredelungs-Staffeln: { discounts:[{minQuantity,maxQuantity,price}] } -> Preisersatz
function parseDecorationTiers(mf) {
    try {
        const raw = mf && mf.value ? JSON.parse(mf.value) : null;
        const list = Array.isArray(raw?.discounts) ? raw.discounts : Array.isArray(raw) ? raw : [];
        return list
            .map((d) => ({
                minQuantity: Number(d.minQuantity) || 0,
                maxQuantity: d.maxQuantity != null ? Number(d.maxQuantity) : null,
                price: Number(d.price) || 0,
            }))
            .filter((t) => t.price > 0)
            .sort((a, b) => a.minQuantity - b.minQuantity);
    } catch (e) {
        return [];
    }
}

// Produkt-Rabatt gültig für totalQty zurückgeben
function pickProductDiscount(totalQty, productDiscounts) {
    if (!Array.isArray(productDiscounts) || !productDiscounts.length) return { discountSum: 0, discountPercentage: 0 };
    const tier =
        productDiscounts.find(
            (t) => totalQty >= t.minQuantity && (t.maxQuantity == null || totalQty <= t.maxQuantity)
        ) || productDiscounts.filter((t) => totalQty >= t.minQuantity).pop();
    return tier || { discountSum: 0, discountPercentage: 0 };
}

// Veredelungs-Preisstaffel (Ersatzpreis) wählen
function pickDecorationUnit(totalQty, tiers, fallbackUnit) {
    if (!Array.isArray(tiers) || !tiers.length) return fallbackUnit;
    const tier =
        tiers.find((t) => totalQty >= t.minQuantity && (t.maxQuantity == null || totalQty <= t.maxQuantity)) ||
        tiers.filter((t) => totalQty >= t.minQuantity).pop();
    return tier ? tier.price : fallbackUnit;
}

function pickTierPrice(totalQty, tiers, fallbackUnit) {
    if (!Array.isArray(tiers) || tiers.length === 0) return fallbackUnit == null ? null : fallbackUnit;
    const hit = tiers.filter((t) => totalQty >= t.min).pop();
    return hit ? Number(hit.price) : fallbackUnit == null ? null : fallbackUnit;
}

// Zusatzveredelung (fix netto)
const EXTRA_DECORATION_UNIT_NET = 3.5;

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
    const exclusion = EXCLUDED_FROM_ALL.map((t) => `-tag:'${t}'`).join(" ");
    const qStr = [queryTerm, exclusion].filter(Boolean).join(" ") || undefined;

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

    console.log("ITENS", items);

    return { items, endCursor: conn?.pageInfo?.endCursor || null, hasNextPage: !!conn?.pageInfo?.hasNextPage };
}

async function fetchPricingMeta(handle) {
    const gql = `
    query PricingMeta($handle:String!) {
      productByHandle(handle:$handle) {
        preisReduktion: metafield(namespace:"custom", key:"preis_reduktion"){ value }
      }
      front: products(first:1, query:"veredelung-brust") {
        edges { node {
          variants(first:1){ edges{ node{ price{ amount } } } }
          preisReduktion: metafield(namespace:"custom", key:"preis_reduktion"){ value }
        } }
      }
      back: products(first:1, query:"veredelung-rucken") {
        edges { node {
          variants(first:1){ edges{ node{ price{ amount } } } }
          preisReduktion: metafield(namespace:"custom", key:"preis_reduktion"){ value }
        } }
      }
    }`;

    const data = await callShopify(gql, { handle });

    const prodMF = data?.productByHandle?.preisReduktion;
    const productDiscounts = parseProductDiscounts(prodMF);

    const frontNode = data?.front?.edges?.[0]?.node;
    const backNode = data?.back?.edges?.[0]?.node;

    const frontBase = Number(frontNode?.variants?.edges?.[0]?.node?.price?.amount) || 6.5;
    const backBase = Number(backNode?.variants?.edges?.[0]?.node?.price?.amount) || 6.5;

    console.groupCollapsed("[PRICING META]", handle);
    console.log("productDiscounts (raw):", productDiscounts);
    console.log("front tiers:", { base: frontBase, tiers: parseDecorationTiers(frontNode?.preisReduktion) });
    console.log("back  tiers:", { base: backBase, tiers: parseDecorationTiers(backNode?.preisReduktion) });
    console.groupEnd();

    return {
        productDiscounts, // ← Rabatt-Tiers (discountSum / discountPercentage)
        front: { tiers: parseDecorationTiers(frontNode?.preisReduktion), base: frontBase },
        back: { tiers: parseDecorationTiers(backNode?.preisReduktion), base: backBase },
    };
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
            const MIN_SEED = 12; // so wirkt’s “voll”
            let nextAfter = reset ? null : after;
            let acc = reset ? [] : [...results];

            // erste Seite
            let page = await searchProductsPage({
                queryTerm: q,
                after: nextAfter,
                pageSize: 24,
            });
            nextAfter = page.endCursor;
            let nextHasNext = page.hasNextPage;
            acc = reset ? page.items.filter(isAllowedProduct) : [...acc, ...page.items.filter(isAllowedProduct)];

            // wenn initial zu wenig übrig bleibt: weitere Seiten nachschieben
            while (reset && acc.length < MIN_SEED && nextHasNext) {
                page = await searchProductsPage({
                    queryTerm: q,
                    after: nextAfter,
                    pageSize: 24,
                });
                nextAfter = page.endCursor;
                nextHasNext = page.hasNextPage;
                acc = [...acc, ...page.items.filter(isAllowedProduct)];
            }

            setResults(acc);
            setAfter(nextAfter);
            setHasNext(nextHasNext);
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
// ---- Rechte Spalte: Varianten (Farbe -> Größenliste) ----
function VariantMatrix({ product, onChangeTotalQty, onChangeRows, productDiscounts = [] }) {
    const [rows, setRows] = useState({});
    const [selectedColor, setSelectedColor] = useState(null);

    // simple parser: "SIZE / COLOR" -> {size, color}
    const parseTitle = (t = "") => {
        const parts = String(t)
            .split("/")
            .map((s) => s.trim());
        if (parts.length >= 2) return { size: parts[0], color: parts.slice(1).join(" / ") };
        // Fallback falls Titel anders formatiert ist
        return { size: t, color: "—" };
    };

    // Größen-Sortierung wie im Shop
    const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"];
    const sizeRank = (s) => {
        const i = sizeOrder.indexOf(String(s).toUpperCase());
        return i === -1 ? 999 : i;
    };

    // initialisieren / Produktwechsel
    useEffect(() => {
        if (!product) {
            setRows({});
            onChangeRows({});
            onChangeTotalQty(0);
            setSelectedColor(null);
            return;
        }

        const next = {};
        (product.variants?.edges || []).forEach(({ node }) => {
            next[node.id] = {
                title: node.title,
                price: toNumber(node.price?.amount),
                qty: 0,
                ...parseTitle(node.title),
            };
        });

        setRows(next);
        onChangeRows(next);
        onChangeTotalQty(0);

        // erste Farbe wählen
        const colors = Array.from(new Set(Object.values(next).map((v) => v.color))).filter(Boolean);
        setSelectedColor(colors[0] || null);
    }, [product]);

    // total qty melden
    useEffect(() => {
        const totalQty = Object.values(rows).reduce((s, r) => s + toNumber(r.qty), 0);
        onChangeTotalQty(totalQty);
    }, [rows]);

    if (!product) {
        return (
            <div className="rounded-3xl bg-white p-4 shadow-sm border min-h-[240px] flex items-center justify-center text-gray-400">
                Bitte links ein Produkt wählen.
            </div>
        );
    }

    // verfügbare Farben + gefilterte Größen der aktiven Farbe
    const all = Object.entries(rows).map(([id, r]) => ({ id, ...r }));
    const totalQtyAllVariants = all.reduce((s, r) => s + toNumber(r.qty), 0);

    // Produkt-Rabatt-Tier holen
    const { discountSum, discountPercentage } = pickProductDiscount(totalQtyAllVariants, productDiscounts || []);

    const rowsWithEffectiveUnit = all.map((v) => {
        const base = Number(v.price || 0);
        const unit = Math.max(0, base - (discountSum || 0)); // ← hier
        return { ...v, unit };
    });

    const colors = Array.from(new Set(all.map((v) => v.color)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "de"));
    const sizesForColor = rowsWithEffectiveUnit
        .filter((v) => v.color === selectedColor)
        .sort((a, b) => sizeRank(a.size) - sizeRank(b.size));

    const variantsSum = rowsWithEffectiveUnit.reduce((s, r) => s + toNumber(r.qty) * toNumber(r.unit), 0);

    return (
        <div className="rounded-3xl bg-white p-4 shadow-sm border">
            {/* Produktkopf */}
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

            {/* Farbauswahl */}
            <div className="mt-4">
                <div className="text-sm font-medium mb-2">Farbe</div>
                <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            className={`px-3 py-1.5 rounded-xl border text-sm transition ${
                                c === selectedColor ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"
                            }`}
                            title={c}
                        >
                            {c}
                        </button>
                    ))}
                    {colors.length === 0 && <span className="text-xs text-gray-500">Keine Farben erkannt</span>}
                </div>
            </div>

            {/* Größenliste der gewählten Farbe */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {sizesForColor.map((v) => (
                    <div key={v.id} className="border rounded-xl p-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="font-medium">{v.size}</div>
                            <div className="text-sm opacity-70">{currency(v.unit)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                value={v.qty}
                                onChange={(e) => {
                                    const qty = toNumber(e.target.value);
                                    setRows((prev) => {
                                        const next = { ...prev, [v.id]: { ...prev[v.id], qty } };
                                        onChangeRows(next);
                                        return next;
                                    });
                                }}
                                className="w-28 px-3 py-2 rounded-lg border border-gray-200"
                            />
                            <span className="opacity-60 text-sm">Stück</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">{selectedColor}</div>
                    </div>
                ))}
            </div>

            {/* Summe aller Varianten über alle Farben */}
            <div className="mt-3 text-sm opacity-70">
                Zwischensumme Varianten: <b>{currency(variantsSum)}</b>
            </div>
        </div>
    );
}

// ---- Veredelungen (nur Menge, Preis automatisch aus Staffel) ----

function Veredelungen({ onChange, frontPricing, backPricing, productTotalQty = 0 }) {
    const [items, setItems] = useState([
        { id: "front-1", side: "front", title: "Veredelung Front", qty: 0 },
        { id: "back-1", side: "back", title: "Veredelung Rücken", qty: 0 },
    ]);

    // helper: zählt je Seite die Reihenfolge (1 = erste, >1 = Zusatz)
    function indexWithinSide(list, item) {
        const same = list.filter((x) => x.side === item.side);
        const pos = same.findIndex((x) => x.id === item.id);
        return pos === -1 ? 1 : pos + 1;
    }

    const computed = useMemo(() => {
        // nur Zeilen mit qty>0
        const active = items.filter((it) => toNumber(it.qty) > 0);

        // Reihenfolge pro Seite bewahren: erste aktive ist "main"
        const mainIdBySide = {};
        // const totalsBySide = {};
        for (const it of active) {
            if (!mainIdBySide[it.side]) mainIdBySide[it.side] = it.id;
            // totalsBySide[it.side] = (totalsBySide[it.side] || 0) + toNumber(it.qty);
        }

        return items.map((it) => {
            const qty = toNumber(it.qty);
            if (qty <= 0) return { ...it, unit: 0, sum: 0, extra: false };

            const isMain = mainIdBySide[it.side] === it.id; // ← exakt eine Hauptzeile pro Seite
            if (!isMain) {
                const unit = EXTRA_DECORATION_UNIT_NET; // €3.50
                return { ...it, unit, sum: unit * qty, extra: true };
            }

            // Hauptzeile staffelt nach Gesamtmenge dieser Seite
            // const sideTotal = totalsBySide[it.side] || qty;
            const total = Math.max(0, Number(productTotalQty) || 0);

            if (it.side === "front") {
                const unit = pickDecorationUnit(total, frontPricing?.tiers || [], frontPricing?.base || 6.5);
                const sumMain = unit + Math.max(0, qty - 1) * EXTRA_DECORATION_UNIT_NET;
                return { ...it, unit, sum: sumMain, extra: false };
            }
            if (it.side === "back") {
                const unit = pickDecorationUnit(total, backPricing?.tiers || [], backPricing?.base || 6.5);
                const sumMain = unit + Math.max(0, qty - 1) * EXTRA_DECORATION_UNIT_NET;

                return { ...it, unit, sum: sumMain, extra: false };
            }
            const unit = 6.5;
            const sumMain = unit + Math.max(0, qty - 1) * EXTRA_DECORATION_UNIT_NET;

            return { ...it, unit, sum: sumMain, extra: false };
        });
    }, [items, frontPricing, backPricing, productTotalQty]);

    useEffect(() => {
        onChange(computed);
    }, [computed]);

    const update = (id, patch) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    const add = () => {
        // default neue Zeile = Front (der User kann Side umstellen)
        setItems((prev) => [
            ...prev,
            { id: Math.random().toString(36).slice(2), side: "front", title: "Veredelung Front", qty: 0 },
        ]);
    };
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
                        className="grid grid-cols-1 md:grid-cols-[110px,1fr,120px,1fr,44px] gap-2 border rounded-xl p-3"
                    >
                        {/* Seite wählen */}
                        <select
                            value={it.side}
                            onChange={(e) => {
                                const side = e.target.value === "back" ? "back" : "front";
                                const title = side === "back" ? "Veredelung Rücken" : "Veredelung Front";
                                update(it.id, { side, title });
                            }}
                            className="px-3 py-2 rounded-lg border border-gray-200"
                            title="Seite"
                        >
                            <option value="front">Front</option>
                            <option value="back">Rücken</option>
                        </select>

                        <input
                            value={it.title}
                            onChange={(e) => update(it.id, { title: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-gray-200"
                            placeholder="Titel"
                        />
                        <input
                            type="number"
                            min="0"
                            value={it.qty}
                            onChange={(e) => update(it.id, { qty: toNumber(e.target.value) })}
                            className="px-3 py-2 rounded-lg border border-gray-200"
                            placeholder="Menge"
                            title="Anzahl Teile, die auf dieser Seite veredelt werden"
                        />
                        <div className="flex items-center justify-between text-sm">
                            <div className="opacity-70">
                                Einzelpreis: <b>{currency(it.unit)}</b>
                                {it.extra ? " (Zusatz)" : ""}
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

            <div className="mt-1 text-xs text-gray-500">
                1. Veredelung pro Seite staffelt (Shopify-Tiers). Jede weitere auf derselben Seite: €3.50 netto.
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
                                            {r.qty} × {currency(r.unit)} ={" "}
                                            <b>{currency(Number.isFinite(r.sum) ? r.sum : r.qty * r.unit)}</b>{" "}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-2 text-sm">
                                {(it.refinements || []).map((r) => (
                                    <div key={r.key} className="flex items-center justify-between">
                                        <div className="opacity-80">{r.title}</div>
                                        <div className="opacity-60">
                                            {r.qty} × {currency(r.unit)} ={" "}
                                            <b>{currency(Number.isFinite(r.sum) ? r.sum : r.qty * r.unit)}</b>{" "}
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
    const [productTotalQty, setProductTotalQty] = useState(0); // <- NEU
    const [customerProfile, setCustomerProfile] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [refinements, setRefinements] = useState([]);
    const [offerItems, setOfferItems] = useState([]);
    const [notes, setNotes] = useState("");
    const [archive, setArchive] = useState([]);
    const [pricing, setPricing] = useState({
        productDiscounts: [],
        front: { tiers: [], base: 6.5 },
        back: { tiers: [], base: 6.5 },
    });

    const summaryRef = useRef(null);

    console.log(user);

    // Profil (Firmenkunde) laden – identisch zu deinem Dashboard-Index
    useEffect(() => {
        const uid = auth.currentUser?.uid || null;
        if (!uid) return;
        (async () => {
            try {
                const data = await fetchDashboardData({ email, uid, maxPending: 50 });
                console.log("DATA", data);

                setDashboardData(data);
            } catch (e) {
                console.error("[Angebot] Firebase Profil laden fehlgeschlagen:", e);
            }
        })();
    }, [user /*, devEmail falls vorhanden */]);

    // 1) Auth-State einmal setzen
    useEffect(() => {
        const unsub = auth.onAuthStateChanged((u) => {
            setUser(u);
        });
        return () => unsub();
    }, []);

    // 2) Sobald user da ist, Dashboard-/Profil-Daten laden
    useEffect(() => {
        if (!user) {
            console.log("[Angebot] kein User, lade kein Profil");
            return;
        }

        const uid = user.uid;
        const email = user.email || null;
        console.log("[Angebot] lade Profil für UID:", uid, "Email:", email);

        (async () => {
            try {
                const data = await fetchDashboardData({ email, uid, maxPending: 50 });
                console.log("[Angebot] DashboardData:", data);

                setDashboardData(data);
                setCustomerProfile(data?.profile || null);
            } catch (e) {
                console.error("[Angebot] Firebase Profil-Load Fehler:", e);
            }
        })();
    }, [user]);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((u) => setUser(u));
        return () => unsub();
    }, []);

    useEffect(() => {
        let active = true;
        (async () => {
            if (!selected || !selected.handle) {
                setPricing({ productDiscounts: [], front: { tiers: [], base: 6.5 }, back: { tiers: [], base: 6.5 } });
                return;
            }
            const p = await fetchPricingMeta(selected.handle);
            if (active) setPricing(p);
        })();
        return () => {
            active = false;
        };
    }, [selected?.handle]);

    const addPosition = () => {
        if (!selected) return;

        const totalQty = Object.values(variantRows).reduce((s, r) => s + toNumber(r.qty), 0);
        const { discountSum, discountPercentage } = pickProductDiscount(totalQty, pricing.productDiscounts || []);

        const variantList = Object.entries(variantRows)
            .filter(([, r]) => toNumber(r.qty) > 0)
            .map(([id, r]) => {
                const base = toNumber(r.price);
                const unit = Math.max(0, base - (discountSum || 0)); // ← hier
                return { key: `v-${id}`, variantId: id, title: r.title, qty: toNumber(r.qty), unit };
            });

        const refinementsList = (refinements || [])
            .filter((r) => toNumber(r.qty) > 0)
            .map((r) => ({
                key: `r-${r.id || r.title}`,
                title: r.title,
                qty: toNumber(r.qty),
                unit: toNumber(r.unit),
                sum: toNumber(r.sum), // <- mitnehmen
            }));

        const sum =
            variantList.reduce((s, r) => s + r.qty * r.unit, 0) +
            refinementsList.reduce((s, r) => s + (Number.isFinite(r.sum) ? r.sum : r.qty * r.unit), 0);

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
        const now = new Date();
        const offerNumber = `AN-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${String(now.getHours()).padStart(
            2,
            "0"
        )}${String(now.getMinutes()).padStart(2, "0")}`;

        // offerItems -> cartItems (Struktur, die CartOfferPDF erwartet)
        const cartItems = (offerItems || []).map((it) => ({
            id: it.key,
            productName: it.productName,
            product: {
                productName: it.productName,
                images: { edges: [{ node: { originalSrc: it.productImage } }] },
            },
            variants: Object.fromEntries(
                (it.variantRows || []).map((r) => [
                    r.title,
                    { quantity: Number(r.qty) || 0, price: Number(r.unit) || 0 },
                ])
            ),

            // 🔧 Split each refinement row into "main" + "extra" lines for the PDF
            refinements: (it.refinements || []).flatMap((r) => {
                const qty = Number(r.qty) || 0;
                const unit = Number(r.unit) || 0;
                const side = /rück/i.test(r.title) ? "Rücken" : "Front";
                const rows = [];

                if (qty >= 1) {
                    rows.push({
                        title: `Veredelung ${side}`,
                        quantity: 1,
                        price: unit,
                        // ensure the PDF doesn't recompute:
                        sum: unit,
                    });
                }
                if (qty > 1) {
                    const extras = qty - 1;
                    rows.push({
                        title: `Zusatzveredelungen ${side}`,
                        quantity: extras,
                        price: EXTRA_DECORATION_UNIT_NET,
                        sum: extras * EXTRA_DECORATION_UNIT_NET,
                    });
                }
                return rows;
            }),

            totalPrice: Number(it.totalPrice) || 0,
            design: { front: { downloadURL: it.productImage } },
        }));

        // --- Kunde aus Firestore-Profil mappen ---
        const p = customerProfile || {};
        const customer = {
            company: p.companyName || "",
            name: p.contactPerson || "", // falls du später Ansprechpartner speicherst
            street: p.companyAdress || "",
            city: p.companyCity || "",
            country: "Deutschland", // kannst du aus Profil ziehen, falls vorhanden
            customerNumber: p.businessNumber || "",
        };

        console.log(p);

        // Angebotsnummer generieren (Beispiel)
        const today = new Date();
        const anNumber = `AN-${today.toISOString().slice(0, 10).replace(/-/g, "")}-${today
            .getFullYear()
            .toString()
            .slice(-2)}`;

        const docMeta = {
            type: "Angebot",
            number: anNumber,
            reference: "",
            date: today,
            deliveryDate: "",
            validUntil: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 Tage gültig
            contact: "MAINPLOTT Vertrieb", // oder p.email / p.contactPerson
        };

        const doc = (
            <CartOfferPDF
                cartItems={cartItems}
                totalPrice={netTotal} // <- statt sumNet
                userNotes={notes}
                vatRate={VAT_RATE}
                b2bMode={true}
                logoSrc={Logo.src}
                // optional: nur setzen, wenn du Kopf wie im Muster brauchst
                customer={customer}
                docMeta={docMeta}
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
                                    onChangeTotalQty={setProductTotalQty}
                                    onChangeRows={setVariantRows}
                                    productDiscounts={pricing.productDiscounts}
                                />
                                <Veredelungen
                                    onChange={setRefinements}
                                    frontPricing={pricing.front}
                                    backPricing={pricing.back}
                                    productTotalQty={productTotalQty}
                                />
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
