// pages/dashboard/orders.jsx  (oder app/dashboard/orders/page.jsx bei App Router)
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useShopifyCustomer } from "@/hooks/useShopifyCustomer";
import { auth, fetchPendingOrders, deletePendingOrder } from "@/config/firebase";
import {
    FiHome,
    FiShoppingBag,
    FiUploadCloud,
    FiFileText,
    FiMapPin,
    FiLogOut,
    FiChevronDown,
    FiChevronUp,
    FiRefreshCcw,
} from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";

/** ---- kleine Utils ---- */
function fmtMoney(n) {
    const num = typeof n === "number" ? n : parseFloat(n || 0);
    if (Number.isNaN(num)) return "€0,00";
    return num.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}
function toDate(val) {
    if (!val) return null;
    if (val?.toDate) return val.toDate();
    if (typeof val === "object" && typeof val.seconds === "number") {
        return new Date(val.seconds * 1000 + Math.round((val.nanoseconds || 0) / 1e6));
    }
    if (typeof val === "string") return new Date(val);
    return null;
}

const SIZE_ORDER = { XXS: 0, XS: 1, S: 2, M: 3, L: 4, XL: 5, "2XL": 6, "3XL": 7, "4XL": 8, "5XL": 9, "6XL": 10 };
const isFinishKey = (k) => (k || "").toLowerCase().includes("veredel");

function variantBreakdown(snapshot) {
    const v = snapshot?.variants || {};
    const lines = [];
    Object.entries(v).forEach(([label, info]) => {
        if (!info || typeof info !== "object") return;
        if (isFinishKey(label)) return; // Veredelungen separat
        const qty = Number(info.quantity || 0);
        const unit = Number(info.price || 0);
        if (!qty) return;
        lines.push({ label, qty, unit, total: unit * qty });
    });
    lines.sort((a, b) => (SIZE_ORDER[a.label] ?? 999) - (SIZE_ORDER[b.label] ?? 999));
    return lines;
}
function finishingBreakdown(snapshot) {
    const v = snapshot?.variants || {};
    return Object.entries(v)
        .filter(([k, info]) => info && typeof info === "object" && isFinishKey(k))
        .map(([label, info]) => {
            const qty = Number(info.quantity || 0);
            const unit = Number(info.price || 0);
            return { label, qty, unit, total: unit * qty };
        });
}
function designPreviews(snapshot) {
    const front = (snapshot?.sides?.front?.images || []).find((i) => i?.name === "designPreview")?.url || null;
    const back = (snapshot?.sides?.back?.images || []).find((i) => i?.name === "designPreview")?.url || null;
    return { front, back };
}
function uploadedImages(snapshot) {
    const imgs = [
        ...(snapshot?.sides?.front?.images || []).filter((i) => i?.type === "upload"),
        ...(snapshot?.sides?.back?.images || []).filter((i) => i?.type === "upload"),
    ];
    const seen = new Set();
    return imgs.filter((i) => {
        const url = i?.url;
        if (!url || seen.has(url)) return false;
        seen.add(url);
        return true;
    });
}
function textLayers(snapshot) {
    return {
        front: snapshot?.sides?.front?.texts || [],
        back: snapshot?.sides?.back?.texts || [],
    };
}
function computeTotals(entry) {
    const snap = entry?.items?.[0]?.snapshot || {};
    const vLines = variantBreakdown(snap);
    const fLines = finishingBreakdown(snap);
    const pieces = vLines.reduce((s, l) => s + l.qty, 0);
    const total =
        typeof snap.totalPrice === "number"
            ? snap.totalPrice
            : vLines.reduce((s, l) => s + l.total, 0) + fLines.reduce((s, l) => s + l.total, 0);
    return { pieces, total, vLines, fLines, snap };
}

function sumPendingEntry(entry) {
    // Bevorzugt snapshot.totalPrice; sonst Summe aus items[*].config.price * quantity
    try {
        const snapTotal = entry?.items?.[0]?.snapshot?.totalPrice;
        if (typeof snapTotal === "number") return snapTotal;
        let s = 0;
        (entry.items || []).forEach((it) => {
            const price = (it.config || []).find((c) => c.key === "price")?.value;
            const q = it.quantity || 0;
            const p = parseFloat(price || 0);
            s += p * q;
        });
        return s;
    } catch (_) {
        return 0;
    }
}

/** ---- (Stub) Abgeschlossene Bestellungen aus Shopify ----
 * Hier kannst du später deine Storefront-Orders holen (customerAccessToken etc.).
 * Aktuell leer, damit das UI steht.
 */
async function fetchCompletedOrdersShopify(customer) {
    // TODO: implementieren sobald du den Token/Endpoint hast
    return []; // [{id, createdAt, status:"completed", items:[...], total}, ...]
}

export default function OrdersPage() {
    const [devEmail, setDevEmail] = useState("");
    const { customer, loading: loadingCustomer } = useShopifyCustomer(
        process.env.NEXT_PUBLIC_DEV && devEmail ? devEmail : null
    );

    const [pending, setPending] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [loadingPending, setLoadingPending] = useState(true);
    const [loadingCompleted, setLoadingCompleted] = useState(true);
    const [openId, setOpenId] = useState(null); // aktuell geöffneter Eintrag
    const [deletingId, setDeletingId] = useState(null);

    // Laden: Pending (Firestore)
    useEffect(() => {
        const uid = auth.currentUser?.uid || null;
        if (!uid) return;
        (async () => {
            try {
                setLoadingPending(true);
                const rows = await fetchPendingOrders(uid, 50);
                setPending(rows);
            } catch (e) {
                console.error("[orders] pending error", e);
                setPending([]);
            } finally {
                setLoadingPending(false);
            }
        })();
    }, [customer]); // nach Login

    // Laden: Completed (Shopify) – aktuell Stub
    useEffect(() => {
        (async () => {
            try {
                setLoadingCompleted(true);
                const rows = await fetchCompletedOrdersShopify(customer);
                setCompleted(rows);
            } catch (e) {
                console.error("[orders] completed error", e);
                setCompleted([]);
            } finally {
                setLoadingCompleted(false);
            }
        })();
    }, [customer]);

    async function handleDelete(entry) {
        try {
            const uid = auth.currentUser?.uid;
            if (!uid) return;
            if (!window.confirm("Diese Pending-Bestellung wirklich löschen?")) return;

            setDeletingId(entry.id);
            await deletePendingOrder({ uid, pendingId: entry.id });

            setPending((prev) => prev.filter((p) => p.id !== entry.id));
            setOpenId((prev) => (prev === entry.id ? null : prev));
        } catch (e) {
            console.error("Delete failed:", e?.code, e?.message, e);
            alert(`Konnte nicht löschen. ${e?.code || ""}`);
        } finally {
            setDeletingId(null);
        }
    }
    // Tabs (einfach nur zwei Boxen)
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
                        <NavIcon href="/dashboard/orders" icon={<FiShoppingBag />} active />
                        <NavIcon href="/dashboard/uploads" icon={<FiUploadCloud />} />
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
                            <p className="text-sm text-gray-500">Bestellungen</p>
                            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                                <span className="text-gray-900">Hi, </span>
                                <span className="bg-gradient-to-r from-primaryColor to-pink-400 bg-clip-text text-transparent">
                                    {loadingCustomer ? "lädt…" : headerName}
                                </span>
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Hier findest du deine offenen und abgeschlossenen Bestellungen.
                            </p>
                        </div>

                        {/* Listen */}
                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            {/* Pending */}
                            <OrderSection
                                title="PENDING"
                                loading={loadingPending}
                                items={pending}
                                openId={openId}
                                onToggle={setOpenId}
                                onReorder={handleReorder}
                                onDelete={handleDelete}
                                deletingId={deletingId}
                            />

                            <OrderSection
                                title="ABGESCHLOSSEN"
                                loading={loadingCompleted}
                                items={completed}
                                openId={openId}
                                onToggle={setOpenId}
                                onReorder={handleReorder}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

/** ---- Reorder Hook (hier andocken) ----
 * Aktuell: leitet – wenn vorhanden – auf die Produktseite des Snapshots um
 * und hängt ?reorder=<id> an. Passe das auf deine Logik an (Cart-API etc.).
 */
function handleReorder(entry) {
    try {
        const handle = entry?.items?.[0]?.snapshot?.productHandle;
        if (handle) {
            window.location.href = `/product/${handle}?reorder=${entry.id}`;
            return;
        }
        // Fallback: Konfigurator / Kontakt
        window.location.href = `/configurator?reorder=${entry.id}`;
    } catch (e) {
        console.error("Reorder failed", e);
    }
}

/** ---- UI Blöcke ---- */
function OrderSection({ title, loading, items, openId, onToggle, onReorder, onDelete, deletingId, emptyHint }) {
    const sorted = useMemo(() => {
        return (items || []).slice().sort((a, b) => {
            const da = toDate(a.createdAt)?.getTime() || 0;
            const db = toDate(b.createdAt)?.getTime() || 0;
            return db - da;
        });
    }, [items]);

    return (
        <section className="rounded-3xl bg-white p-6 shadow-sm border">
            <div className="mb-3 flex items-center justify-between">
                <SectionTitle>{title}</SectionTitle>
                <span className="rounded-full border px-2 py-0.5 text-xs text-gray-600">{sorted.length}</span>
            </div>

            {loading ? (
                <div className="text-gray-500">lädt…</div>
            ) : sorted.length === 0 ? (
                <div className="text-gray-500">{emptyHint || "Keine Einträge."}</div>
            ) : (
                <ul className="divide-y">
                    {sorted.map((o) => (
                        <OrderRow
                            key={o.id}
                            entry={o}
                            open={openId === o.id}
                            onToggle={() => onToggle(openId === o.id ? null : o.id)}
                            onReorder={() => onReorder(o)}
                            onDelete={onDelete ? () => onDelete(o) : null}
                            deleting={deletingId === o.id}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

function OrderRow({ entry, open, onToggle, onReorder, onDelete, deleting }) {
    const dt = toDate(entry.createdAt);
    const { pieces, total, vLines, fLines, snap } = computeTotals(entry);
    const title = snap?.productTitle || "Artikel";
    const previews = designPreviews(snap);
    const uploads = uploadedImages(snap);
    const texts = textLayers(snap);
    const previewForHeader = previews.front || previews.back || null;

    return (
        <li className="py-3">
            {/* Compact header row */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggle}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-50"
                    aria-label={open ? "Schließen" : "Öffnen"}
                    title={open ? "Schließen" : "Öffnen"}
                >
                    {open ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                {previewForHeader ? (
                    <img
                        src={previewForHeader}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover border bg-gray-50"
                    />
                ) : (
                    <div className="h-10 w-10 rounded-lg bg-gray-100 border" />
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="truncate font-medium">{title}</div>
                        <span className="text-xs text-gray-500">#{entry.id.slice(0, 6)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {pieces ? `${pieces} Stk` : "—"} · {fmtMoney(total)} · {dt ? dt.toLocaleString() : "—"}
                    </div>
                </div>

                <button
                    onClick={onReorder}
                    className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
                    title="Nochmal bestellen"
                >
                    <FiRefreshCcw className="opacity-70" />
                    Nochmal bestellen
                </button>
            </div>

            {/* Details */}
            {open && (
                <div className="mt-3 rounded-xl border bg-gray-50 p-3 text-sm">
                    {/* Varianten */}
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Varianten</div>
                        {vLines.length === 0 ? (
                            <div className="text-gray-500">Keine Varianten gefunden.</div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {vLines.map((l) => (
                                    <div
                                        key={l.label}
                                        className="rounded-lg border bg-white px-3 py-2 flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="font-medium">{l.label}</div>
                                            <div className="text-xs text-gray-500">
                                                {l.qty} Stk × {fmtMoney(l.unit)}
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold">{fmtMoney(l.total)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Veredelungen (optional) */}
                    {fLines.length > 0 && (
                        <div className="mt-3">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Veredelungen</div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {fLines.map((l, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-lg border bg-white px-3 py-2 flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="font-medium">{l.label.split("Veredelung")[0]}</div>
                                            <div className="text-xs text-gray-500">
                                                {l.qty} × {fmtMoney(l.unit)}
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold">{fmtMoney(l.total)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Previews */}
                    {(previews.front || previews.back) && (
                        <div className="mt-3">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Preview</div>
                            <div className="grid grid-cols-2 gap-2">
                                {previews.front && (
                                    <div className="rounded-lg border bg-white p-2">
                                        <div className="text-xs text-gray-500 mb-1">Front</div>
                                        <img
                                            src={previews.front}
                                            alt="Front"
                                            className="w-full rounded-md object-cover"
                                        />
                                    </div>
                                )}
                                {previews.back && (
                                    <div className="rounded-lg border bg-white p-2">
                                        <div className="text-xs text-gray-500 mb-1">Back</div>
                                        <img
                                            src={previews.back}
                                            alt="Back"
                                            className="w-full rounded-md object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Uploads */}
                    {uploads.length > 0 && (
                        <div className="mt-3">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Uploads</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                {uploads.map((u, i) => (
                                    <div key={i} className="rounded-lg border bg-white p-2">
                                        <img src={u.url} alt="" className="w-full h-24 object-contain rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Texte */}
                    {(texts.front.length > 0 || texts.back.length > 0) && (
                        <div className="mt-3">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Texte</div>
                            <div className="grid md:grid-cols-2 gap-3">
                                {["front", "back"].map((side) => {
                                    const list = texts[side] || [];
                                    if (list.length === 0) return null;
                                    return (
                                        <div key={side} className="rounded-lg border bg-white p-2">
                                            <div className="text-xs text-gray-500 mb-2 capitalize">{side}</div>
                                            <div className="space-y-2">
                                                {list.map((t, idx) => (
                                                    <div key={idx} className="flex items-center justify-between">
                                                        <div className="min-w-0">
                                                            <div className="font-medium truncate">{t.value || "—"}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {t.fontFamily || "—"} ·{" "}
                                                                {t.fontSize ? `${t.fontSize}px` : "—"}
                                                            </div>
                                                        </div>
                                                        {t.fill && (
                                                            <span
                                                                className="ml-3 inline-block h-4 w-4 rounded border"
                                                                style={{ backgroundColor: t.fill }}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Aktionen */}
                    <div className="mt-3 flex justify-end gap-2">
                        <button
                            onClick={onReorder}
                            className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-white"
                            title="Nochmal bestellen"
                        >
                            <FiRefreshCcw className="opacity-70" />
                            Nochmal bestellen
                        </button>
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                disabled={deleting}
                                className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-white ${
                                    deleting ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
                                }`}
                                title="Bestellung löschen"
                            >
                                <FiTrash2 className="opacity-90" />
                                {deleting ? "Löscht…" : "Löschen"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </li>
    );
}

function Detail({ label, value }) {
    return (
        <div>
            <div className="text-xs text-gray-500">{label}</div>
            <div className="font-medium text-gray-800">{value}</div>
        </div>
    );
}

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
