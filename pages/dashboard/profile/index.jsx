import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    FiHome,
    FiShoppingBag,
    FiUploadCloud,
    FiFileText,
    FiMapPin,
    FiLogOut,
    FiUser,
    FiSave,
    FiKey,
    FiMail,
} from "react-icons/fi";
import {
    auth,
    fetchDashboardData,
    updateFirestoreProfile,
    sendPasswordResetForEmail,
    changePasswordWithReauth,
} from "@/config/firebase";

export default function DashboardProfile() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pwdChanging, setPwdChanging] = useState(false);

    // Formularzustand
    const [form, setForm] = useState({
        companyName: "",
        companyAdress: "",
        companyCity: "",
        businessNumber: "",
        email: "",
        userType: "",
    });

    // Laden der Daten (identisch zur Startseite)
    useEffect(() => {
        const email = auth.currentUser?.email || null;
        const uid = auth.currentUser?.uid || null;
        if (!email && !uid) return;

        (async () => {
            try {
                setLoading(true);
                const data = await fetchDashboardData({ email, uid, maxPending: 50 });
                setDashboardData(data);
                // Formular befüllen
                const p = data?.profile || {};
                setForm({
                    companyName: p.companyName || "",
                    companyAdress: p.companyAdress || "",
                    companyCity: p.companyCity || "",
                    businessNumber: p.businessNumber || "",
                    email: p.email || auth.currentUser?.email || "",
                    userType: p.userType || "",
                });
            } catch (e) {
                console.error("[Profile] load error:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const profileMeta = useMemo(() => {
        const p = dashboardData?.profile || {};
        return {
            collection: p._collection || "users",
            docId: p.id || p.uid || auth.currentUser?.uid,
        };
    }, [dashboardData]);

    async function onSave() {
        if (!profileMeta.docId || !profileMeta.collection) return;
        try {
            setSaving(true);
            // E‑Mail in Auth separat – hier wird NUR Firestore Profil gespeichert
            await updateFirestoreProfile({
                collection: profileMeta.collection,
                docId: profileMeta.docId,
                data: {
                    companyName: form.companyName.trim(),
                    companyAdress: form.companyAdress.trim(),
                    companyCity: form.companyCity.trim(),
                    businessNumber: form.businessNumber.trim(),
                    userType: form.userType.trim(),
                    email: form.email.trim(), // als Profilfeld ok; Auth‑E-Mail ändert das NICHT
                    updatedAt: new Date().toISOString(),
                },
            });
            // Nachladen (optional)
            const data = await fetchDashboardData({
                email: auth.currentUser?.email || form.email,
                uid: auth.currentUser?.uid,
                maxPending: 50,
            });
            setDashboardData(data);
            alert("Profil gespeichert.");
        } catch (e) {
            console.error("[Profile] save error:", e);
            alert("Konnte Profil nicht speichern.");
        } finally {
            setSaving(false);
        }
    }

    async function sendReset() {
        const email = auth.currentUser?.email || form.email;
        if (!email) return alert("Keine E‑Mail gefunden.");
        try {
            await sendPasswordResetForEmail(email);
            alert("Reset‑E‑Mail gesendet.");
        } catch (e) {
            console.error(e);
            alert("Konnte Reset‑E‑Mail nicht senden.");
        }
    }

    async function changePasswordDirect(oldPwd, newPwd) {
        try {
            setPwdChanging(true);
            await changePasswordWithReauth(oldPwd, newPwd);
            alert("Passwort geändert.");
        } catch (e) {
            console.error(e);
            alert("Passwortänderung fehlgeschlagen.");
        } finally {
            setPwdChanging(false);
        }
    }

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
                        <NavIcon href="/dashboard/angebot" icon={<FiFileText />} />
                        {/* <NavIcon href="/dashboard/addresses" icon={<FiMapPin />} /> */}
                        <NavIcon href="/dashboard/profile" icon={<FiUser />} active />
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
                            <p className="text-sm text-gray-500">Profil</p>
                            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                                <span className="text-gray-900">Deine Daten verwalten</span>
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Firmen- und Kontaktdaten bearbeiten. Passwort kannst du unten ändern.
                            </p>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-3">
                            {/* Profilformular */}
                            <div className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm border">
                                <SectionTitle>Firmendaten</SectionTitle>
                                {loading ? (
                                    <div className="text-gray-500">Lädt…</div>
                                ) : (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            onSave();
                                        }}
                                        className="grid grid-cols-1 gap-4 md:grid-cols-2"
                                    >
                                        <Input
                                            label="Firmenname"
                                            value={form.companyName}
                                            onChange={(v) => setForm((s) => ({ ...s, companyName: v }))}
                                        />
                                        <Input
                                            label="USt‑ID / Steuernr."
                                            value={form.businessNumber}
                                            onChange={(v) => setForm((s) => ({ ...s, businessNumber: v }))}
                                        />
                                        <Input
                                            label="Adresse"
                                            value={form.companyAdress}
                                            onChange={(v) => setForm((s) => ({ ...s, companyAdress: v }))}
                                        />
                                        <Input
                                            label="PLZ / Ort"
                                            value={form.companyCity}
                                            onChange={(v) => setForm((s) => ({ ...s, companyCity: v }))}
                                        />
                                        <Input
                                            label="E‑Mail (Profilfeld)"
                                            icon={<FiMail />}
                                            value={form.email}
                                            onChange={(v) => setForm((s) => ({ ...s, email: v }))}
                                            tooltip="Ändert NICHT deine Login‑E‑Mail in Firebase Auth."
                                        />
                                        {/* <Input
                                            label="Kundentyp"
                                            value={form.userType}
                                            onChange={(v) => setForm((s) => ({ ...s, userType: v }))}
                                            placeholder="firmenkunde / privatkunde …"
                                        /> */}

                                        <div className="md:col-span-2 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
                                            >
                                                <FiSave />
                                                {saving ? "Speichert…" : "Speichern"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Passwort / Sicherheit */}
                            <div className="rounded-3xl bg-white p-6 shadow-sm border">
                                <SectionTitle>Sicherheit</SectionTitle>
                                <div className="space-y-4 text-sm">
                                    <div className="rounded-xl border p-4">
                                        <div className="font-medium mb-2">Passwort zurücksetzen</div>
                                        <p className="text-gray-600 mb-3">
                                            Wir senden dir einen Link an{" "}
                                            <b>{auth.currentUser?.email || form.email || "—"}</b>.
                                        </p>
                                        <button
                                            onClick={sendReset}
                                            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-white hover:opacity-90"
                                        >
                                            <FiKey /> Reset‑E‑Mail senden
                                        </button>
                                    </div>

                                    <DirectChangePassword onSubmit={changePasswordDirect} loading={pwdChanging} />
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

/* ---------- Kleine UI‑Hilfen ---------- */
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

function Input({ label, value, onChange, icon, placeholder, tooltip }) {
    return (
        <label className="block">
            <div className="mb-1 text-xs font-medium text-gray-600 flex items-center gap-2">
                <span>{label}</span>
                {tooltip && <span className="text-[11px] text-gray-400">({tooltip})</span>}
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
                {icon && <span className="text-gray-400">{icon}</span>}
                <input
                    className="w-full outline-none"
                    value={value}
                    placeholder={placeholder || ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </label>
    );
}

function DirectChangePassword({ onSubmit, loading }) {
    const [show, setShow] = useState(false);
    const [oldPwd, setOldPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [newPwd2, setNewPwd2] = useState("");

    return (
        <div className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
                <div className="font-medium">Passwort direkt ändern (Re‑Auth)</div>
                <button onClick={() => setShow((s) => !s)} className="text-xs text-gray-600 underline">
                    {show ? "schließen" : "öffnen"}
                </button>
            </div>
            {show && (
                <form
                    className="mt-3 space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (newPwd !== newPwd2) return alert("Neue Passwörter stimmen nicht überein.");
                        onSubmit(oldPwd, newPwd);
                    }}
                >
                    <PasswordInput label="Altes Passwort" value={oldPwd} onChange={setOldPwd} />
                    <PasswordInput label="Neues Passwort" value={newPwd} onChange={setNewPwd} />
                    <PasswordInput label="Neues Passwort wiederholen" value={newPwd2} onChange={setNewPwd2} />
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl bg-primaryColor px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
                    >
                        <FiKey /> {loading ? "Ändere…" : "Passwort ändern"}
                    </button>
                </form>
            )}
        </div>
    );
}

function PasswordInput({ label, value, onChange }) {
    const [visible, setVisible] = useState(false);
    return (
        <label className="block">
            <div className="mb-1 text-xs font-medium text-gray-600">{label}</div>
            <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
                <input
                    className="w-full outline-none"
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <button type="button" onClick={() => setVisible((s) => !s)} className="text-xs text-gray-500 underline">
                    {visible ? "verbergen" : "anzeigen"}
                </button>
            </div>
        </label>
    );
}
