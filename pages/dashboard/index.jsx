import Link from "next/link";
import { useShopifyCustomer } from "@/hooks/useShopifyCustomer";
import { auth, fetchDashboardData } from "@/config/firebase"; // <— fetchDashboardData hierher
import { FiHome, FiShoppingBag, FiUploadCloud, FiFileText, FiMapPin, FiLogOut } from "react-icons/fi";
import { useEffect, useState } from "react";

export default function DashboardHome() {
    const [devEmail, setDevEmail] = useState("");
    const { customer, loading, refetch } = useShopifyCustomer(
        process.env.NEXT_PUBLIC_DEV && devEmail ? devEmail : null
    );

    const [dashboardData, setDashboardData] = useState(null);

    // >>> hier wird geladen & geloggt
    useEffect(() => {
        // bevorzugt E‑Mail (DEV‑Override), sonst UID
        const email = process.env.NEXT_PUBLIC_DEV && devEmail ? devEmail : customer?.email || null;
        const uid = auth.currentUser?.uid || null;

        if (!email && !uid) return; // warten bis eins da ist

        (async () => {
            try {
                const data = await fetchDashboardData({ email, uid, maxPending: 50 });
                console.log("[Dashboard] Firebase:", data); // <-- dein Log
                setDashboardData(data);
            } catch (e) {
                console.error("[Dashboard] Firebase Fehler:", e);
            }
        })();
    }, [customer, devEmail]); // triggert nach Login & bei DEV‑Wechsel

    const name =
        customer?.firstName || customer?.lastName
            ? `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim()
            : customer?.email || "";

    // Optionaler Test‑Button nur zum erneuten Loggen
    async function logNow() {
        const email = process.env.NEXT_PUBLIC_DEV && devEmail ? devEmail : customer?.email || null;
        const uid = auth.currentUser?.uid || null;
        try {
            const data = await fetchDashboardData({ email, uid, maxPending: 50 });
            console.log("[Dashboard] Manual fetch:", data);
        } catch (e) {
            console.error("[Dashboard] Manual fetch error:", e);
        }
    }
    return (
        <div className="min-h-screen font-body bg-[#f8f7f5]">
            <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
                <div className="flex gap-6">
                    {/* Sidebar */}
                    <aside className="hidden md:flex w-16 flex-col items-center gap-4 rounded-2xl bg-white py-6 shadow-sm border">
                        <div className="h-10 w-10 rounded-full bg-gray-100" />
                        <NavIcon href="/dashboard" icon={<FiHome />} active />
                        <NavIcon href="/dashboard/orders" icon={<FiShoppingBag />} />
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
                    {/* {errorMsg && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
                            {errorMsg}
                        </div>
                    )} */}

                    {/* Main */}
                    <main className="flex-1">
                        {/* DEV: Email Override (nur sichtbar, wenn DEV_MODE=1) */}
                        {process.env.NEXT_PUBLIC_DEV && (
                            <div className="mb-4 flex items-center gap-2 rounded-2xl border bg-white p-3">
                                <input
                                    value={devEmail}
                                    onChange={(e) => setDevEmail(e.target.value)}
                                    placeholder="Dev: E-Mail für Shopify-Fetch"
                                    className="flex-1 rounded-xl border px-3 py-2"
                                />
                                <button
                                    onClick={() => refetch(devEmail)}
                                    className="rounded-xl bg-black px-4 py-2 text-white"
                                >
                                    Test-Fetch
                                </button>
                            </div>
                        )}
                        {/* Head / Hero */}
                        <div className="rounded-3xl bg-white px-6 py-8 shadow-sm border">
                            <p className="text-sm text-gray-500">Willkommen zurück</p>
                            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                                <span className="text-gray-900">Hi, </span>
                                <span className="bg-gradient-to-r from-primaryColor to-pink-400 bg-clip-text text-transparent">
                                    {loading ? "lädt…" : (dashboardData && dashboardData.profile.email) || "User"}
                                </span>
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Hier findest du deine Bestellungen, Uploads und schnelle Aktionen.
                            </p>

                            {/* Quick Actions */}
                            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <QuickCard href="/dashboard/orders" title="Bestellhistorie" icon={<FiShoppingBag />} />
                                <QuickCard href="/dashboard/uploads" title="Uploads" icon={<FiUploadCloud />} />
                                <QuickCard href="/dashboard/quotes" title="Angebotsanfrage" icon={<FiFileText />} />
                                <QuickCard href="/dashboard/addresses" title="Adressen" icon={<FiMapPin />} />
                            </div>
                        </div>

                        {/* Info-Karten */}
                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl bg-white p-6 shadow-sm border">
                                <SectionTitle>Shopify Kunde</SectionTitle>
                                {loading ? (
                                    <div className="text-gray-500">Shopify-Daten werden geladen…</div>
                                ) : customer ? (
                                    <div className="text-sm text-gray-700">
                                        <div className="font-medium">{name || customer.email}</div>
                                        <div className="text-gray-500">{customer.email}</div>
                                        {customer.defaultAddress && (
                                            <div className="mt-3 text-gray-600">
                                                <div className="font-medium">Standardadresse</div>
                                                <div>
                                                    {customer.defaultAddress.company
                                                        ? customer.defaultAddress.company + " · "
                                                        : ""}
                                                    {customer.defaultAddress.address1}
                                                    {customer.defaultAddress.address2
                                                        ? ", " + customer.defaultAddress.address2
                                                        : ""}
                                                    <br />
                                                    {customer.defaultAddress.zip} {customer.defaultAddress.city},{" "}
                                                    {customer.defaultAddress.country}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-500">Kein Shopify-Kunde zu deiner E-Mail gefunden.</div>
                                )}
                            </div>

                            <div className="rounded-3xl bg-white p-6 shadow-sm border">
                                <SectionTitle>Schnellstart</SectionTitle>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <ActionButton href="/dashboard/orders">Letzte Bestellung öffnen</ActionButton>
                                    <ActionButton href="/dashboard/quotes">Direkte Angebotsanfrage</ActionButton>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
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

function QuickCard({ href, title, icon }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 rounded-2xl border bg-white p-4 hover:shadow-sm transition"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 group-hover:bg-gray-900 group-hover:text-white">
                {icon}
            </div>
            <div className="font-medium">{title}</div>
        </Link>
    );
}

function SectionTitle({ children }) {
    return <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{children}</div>;
}

function ActionButton({ href, children }) {
    return (
        <Link href={href} className="rounded-xl bg-primaryColor px-4 py-2 text-center text-white hover:opacity-90">
            {children}
        </Link>
    );
}
