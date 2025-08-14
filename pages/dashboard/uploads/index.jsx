// pages/dashboard/uploads.jsx  (oder app/dashboard/uploads/page.jsx)
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useShopifyCustomer } from "@/hooks/useShopifyCustomer";
import { auth, fetchPendingOrders } from "@/config/firebase";
import {
    FiHome,
    FiShoppingBag,
    FiUploadCloud,
    FiFileText,
    FiMapPin,
    FiLogOut,
    FiSearch,
    FiDownload,
} from "react-icons/fi";

/* ===== Utils ===== */
function toDate(val) {
    if (!val) return null;
    if (val?.toDate) return val.toDate();
    if (typeof val === "object" && typeof val.seconds === "number")
        return new Date(val.seconds * 1000 + Math.round((val.nanoseconds || 0) / 1e6));
    if (typeof val === "string") return new Date(val);
    return null;
}
const filenameFromUrl = (url = "") => {
    try {
        return decodeURIComponent(url.split("?")[0].split("/").pop() || "datei");
    } catch {
        return "datei";
    }
};
const uniqPush = (set, v) => {
    if (v != null) set.add(v);
};

/** Alle Uploads & Texte aus pendingEntries sammeln */
function aggregate(entries) {
    const uploadsMap = new Map(); // url -> data
    const texts = [];

    (entries || []).forEach((entry) => {
        const orderId = entry.id;
        const created = toDate(entry.createdAt);
        (entry.items || []).forEach((it) => {
            const snap = it?.snapshot || {};
            const frontImgs = snap?.sides?.front?.images || [];
            const backImgs = snap?.sides?.back?.images || [];
            const frontTxts = snap?.sides?.front?.texts || [];
            const backTxts = snap?.sides?.back?.texts || [];
            const productTitle = snap?.productTitle || "Artikel";

            // Upload-Images (type: "upload")
            [...frontImgs.map((i) => ({ ...i, side: "front" })), ...backImgs.map((i) => ({ ...i, side: "back" }))]
                .filter((i) => i?.type === "upload" && i?.url)
                .forEach((img) => {
                    const url = img.url;
                    if (!uploadsMap.has(url)) {
                        uploadsMap.set(url, {
                            url,
                            sides: new Set(),
                            orderIds: new Set(),
                            titles: new Set(),
                            count: 0,
                            lastUsedAt: created || null,
                        });
                    }
                    const rec = uploadsMap.get(url);
                    rec.count += 1;
                    uniqPush(rec.sides, img.side);
                    uniqPush(rec.orderIds, orderId);
                    uniqPush(rec.titles, productTitle);
                    const d = created?.getTime?.() || 0;
                    const prev = rec.lastUsedAt?.getTime?.() || 0;
                    if (d > prev) rec.lastUsedAt = created;
                });

            // Textebenen
            frontTxts.forEach((t) => texts.push({ ...t, side: "front", orderId, productTitle, created }));
            backTxts.forEach((t) => texts.push({ ...t, side: "back", orderId, productTitle, created }));
        });
    });

    const uploads = Array.from(uploadsMap.values()).map((r) => ({
        ...r,
        sides: Array.from(r.sides),
        orderIds: Array.from(r.orderIds),
        titles: Array.from(r.titles),
    }));

    // Sortierung: neueste zuerst
    uploads.sort((a, b) => (b.lastUsedAt?.getTime?.() || 0) - (a.lastUsedAt?.getTime?.() || 0));
    texts.sort((a, b) => (b.created?.getTime?.() || 0) - (a.created?.getTime?.() || 0));
    return { uploads, texts };
}

/* ===== Page ===== */
export default function UploadsPage() {
    const [devEmail, setDevEmail] = useState("");
    const { customer, loading: loadingCustomer } = useShopifyCustomer(
        process.env.NEXT_PUBLIC_DEV && devEmail ? devEmail : null
    );

    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter / Suche
    const [query, setQuery] = useState("");
    const [sideFilter, setSideFilter] = useState("all"); // all|front|back

    useEffect(() => {
        const uid = auth.currentUser?.uid || null;
        if (!uid) return;
        (async () => {
            try {
                setLoading(true);
                const rows = await fetchPendingOrders(uid, 100);
                setPending(rows);
            } catch (e) {
                console.error("[uploads] fetch error", e);
                setPending([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [customer]);

    const { uploads, texts } = useMemo(() => aggregate(pending), [pending]);

    const filteredUploads = useMemo(() => {
        return uploads.filter((u) => {
            const q = query.trim().toLowerCase();
            const sideOk = sideFilter === "all" || u.sides.includes(sideFilter);
            const matches =
                !q ||
                u.url.toLowerCase().includes(q) ||
                u.titles.some((t) => t.toLowerCase().includes(q)) ||
                u.orderIds.some((id) => id.toLowerCase().includes(q));
            return sideOk && matches;
        });
    }, [uploads, query, sideFilter]);

    const filteredTexts = useMemo(() => {
        return texts.filter((t) => {
            const q = query.trim().toLowerCase();
            const sideOk = sideFilter === "all" || t.side === sideFilter;
            const matches =
                !q ||
                (t.value || "").toLowerCase().includes(q) ||
                (t.fontFamily || "").toLowerCase().includes(q) ||
                (t.productTitle || "").toLowerCase().includes(q) ||
                (t.orderId || "").toLowerCase().includes(q);
            return sideOk && matches;
        });
    }, [texts, query, sideFilter]);

    const headerName =
        customer?.firstName || customer?.lastName
            ? `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim()
            : customer?.email || "User";

    return (
        <div className="min-h-screen font-body bg-[#f8f7f5]">
            <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
                <div className="flex gap-6">
                    {/* Sidebar */}
                    <aside className="hidden md:flex w-16 flex-col items-center gap-4 rounded-2xl bg-white py-6 shadow-sm border">
                        <div className="h-10 w-10 rounded-full bg-gray-100" />
                        <NavIcon href="/dashboard" icon={<FiHome />} />
                        <NavIcon href="/dashboard/orders" icon={<FiShoppingBag />} />
                        <NavIcon href="/dashboard/uploads" icon={<FiUploadCloud />} active />
                        <NavIcon href="/dashboard/quotes" icon={<FiFileText />} />
                        <NavIcon href="/dashboard/addresses" icon={<FiMapPin />} />
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
                        {/* DEV Override */}
                        {process.env.NEXT_PUBLIC_DEV && (
                            <div className="mb-4 flex items-center gap-2 rounded-2xl border bg-white p-3">
                                <input
                                    value={devEmail}
                                    onChange={(e) => setDevEmail(e.target.value)}
                                    placeholder="Dev: E-Mail"
                                    className="flex-1 rounded-xl border px-3 py-2"
                                />
                            </div>
                        )}

                        {/* Head */}
                        <div className="rounded-3xl bg-white px-6 py-8 shadow-sm border">
                            <p className="text-sm text-gray-500">Uploads & Texte</p>
                            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                                <span className="text-gray-900">Hi, </span>
                                <span className="bg-gradient-to-r from-primaryColor to-pink-400 bg-clip-text text-transparent">
                                    {loadingCustomer ? "lädt…" : headerName}
                                </span>
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Alle hochgeladenen Grafiken und Texte aus deinen offenen Bestellungen.
                            </p>

                            {/* Filter */}
                            <div className="mt-4 flex gap-2 items-center">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Suche (Dateiname, Produkt, Order-ID, Text …)"
                                        className="w-full rounded-xl border pl-9 pr-3 py-2"
                                    />
                                </div>
                                <div className="flex rounded-xl border overflow-hidden">
                                    {["all", "front", "back"].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setSideFilter(v)}
                                            className={`px-3 py-2 text-sm ${
                                                sideFilter === v
                                                    ? "bg-gray-900 text-white"
                                                    : "bg-white hover:bg-gray-50"
                                            }`}
                                        >
                                            {v === "all" ? "Alle" : v === "front" ? "Front" : "Back"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="mt-6 grid gap-6">
                            {/* Uploads */}
                            <section className="rounded-3xl bg-white p-6 shadow-sm border">
                                <div className="mb-3 flex items-center justify-between">
                                    <SectionTitle>Hochgeladene Grafiken</SectionTitle>
                                    <span className="rounded-full border px-2 py-0.5 text-xs text-gray-600">
                                        {filteredUploads.length}
                                    </span>
                                </div>

                                {loading ? (
                                    <div className="text-gray-500">lädt…</div>
                                ) : filteredUploads.length === 0 ? (
                                    <div className="text-gray-500">Keine Uploads gefunden.</div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {filteredUploads.map((u) => (
                                            <div key={u.url} className="rounded-xl border bg-gray-50 p-2">
                                                <div className="aspect-square overflow-hidden rounded-md bg-white border">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={u.url} alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="mt-2">
                                                    <div
                                                        className="text-sm font-medium truncate"
                                                        title={u.titles.join(", ")}
                                                    >
                                                        {u.titles[0] || "—"}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate" title={u.url}>
                                                        {filenameFromUrl(u.url)}
                                                    </div>
                                                    <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                                                        <span>{u.sides.join(" · ") || "—"}</span>
                                                        <span>{u.count}×</span>
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        Orders:{" "}
                                                        {u.orderIds.map((id) => `#${id.slice(0, 6)}`).join(", ")}
                                                    </div>
                                                    <div className="mt-2 flex justify-end">
                                                        <a
                                                            href={u.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-lg border bg-white px-2 py-1 text-xs hover:bg-gray-50"
                                                            title="In neuem Tab öffnen"
                                                        >
                                                            <FiDownload /> Öffnen
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Texte */}
                            <section className="rounded-3xl bg-white p-6 shadow-sm border">
                                <div className="mb-3 flex items-center justify-between">
                                    <SectionTitle>Textebenen</SectionTitle>
                                    <span className="rounded-full border px-2 py-0.5 text-xs text-gray-600">
                                        {filteredTexts.length}
                                    </span>
                                </div>

                                {loading ? (
                                    <div className="text-gray-500">lädt…</div>
                                ) : filteredTexts.length === 0 ? (
                                    <div className="text-gray-500">Keine Texte gefunden.</div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {filteredTexts.map((t, i) => (
                                            <div key={`${t.orderId}-${i}`} className="rounded-xl border bg-white p-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-gray-50">
                                                        <span
                                                            className="text-sm font-semibold"
                                                            style={{ color: t.fill || "#111" }}
                                                        >
                                                            A
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-medium truncate">{t.value || "—"}</div>
                                                            <span className="text-xs text-gray-400">
                                                                #{(t.orderId || "").slice(0, 6)}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate">
                                                            {t.productTitle || "—"}
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-600">
                                                            {t.fontFamily || "—"} ·{" "}
                                                            {t.fontSize ? `${t.fontSize}px` : "—"} · {t.side}
                                                        </div>
                                                    </div>
                                                    {t.fill && (
                                                        <span
                                                            className="h-4 w-4 rounded border"
                                                            style={{ backgroundColor: t.fill }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

/* ===== small shared UI bits ===== */
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
function SectionTitle({ children }) {
    return <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{children}</div>;
}
