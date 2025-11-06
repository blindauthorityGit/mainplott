"use client";
import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { format } from "date-fns";

/* ========== CI / THEME ========== */
const theme = {
    colors: { text: "#1e1e1e", mute: "#666666", line: "#E0E0E0", black: "#000000" },
    fonts: { headline: "Montserrat", body: "Montserrat" },
};

try {
    Font.register({
        family: "Montserrat",
        fonts: [
            { src: "/fonts/Montserrat-Regular.ttf", fontWeight: "normal" },
            { src: "/fonts/Montserrat-Bold.ttf", fontWeight: "700" },
        ],
    });
} catch {}

/* ========== HELPERS ========== */
const currency = (n) => `${Number(n || 0).toFixed(2)} EUR`;
const safe = (v, fb = "") => (v === 0 ? "0" : v || fb);
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const formatDate = (d) => (d instanceof Date ? format(d, "dd.MM.yyyy") : safe(d));

/** Aggregiert Stückzahl und Preis eines Produktes aus Varianten */
function summarizeProductLine(item) {
    if (!item?.variants)
        return { qty: item?.quantity || 0, unit: item?.price || 0, total: item?.totalPrice || 0, mixed: false };

    const entries = Object.values(item.variants).filter((v) => v?.quantity > 0 && typeof v.price !== "undefined");
    const qty = sum(entries.map((e) => Number(e.quantity || 0)));
    const totals = sum(entries.map((e) => Number(e.quantity || 0) * Number(e.price || 0)));
    const uniqueUnitPrices = [...new Set(entries.map((e) => Number(e.price || 0)))];
    const mixed = uniqueUnitPrices.length > 1;
    const unit = mixed ? null : uniqueUnitPrices[0];

    return { qty, unit, total: totals, mixed };
}

/* ========== STYLES ========== */
const styles = StyleSheet.create({
    page: {
        paddingTop: 36,
        paddingHorizontal: 40,
        paddingBottom: 60,
        fontFamily: theme.fonts.body,
        fontSize: 10,
        color: theme.colors.text,
    },
    topRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "flex-start" },
    logo: { width: 170, height: 90, objectFit: "contain" },
    senderLine: { fontSize: 6, color: "#555", marginTop: 4, marginBottom: 10 },
    spacer12: { height: 12 },
    spacer18: { height: 18 },
    addressRow: { flexDirection: "row", justifyContent: "space-between" },
    recipient: { width: "55%", fontSize: 10, lineHeight: 1.4 },
    metaRight: { width: "40%", alignItems: "flex-end", fontSize: 9, lineHeight: 1.35 },
    metaLine: { flexDirection: "row", gap: 8 },
    metaKey: { width: 110, color: theme.colors.mute, textAlign: "right", marginRight: 8 },
    metaVal: { color: theme.colors.text },
    title: { fontSize: 16, fontWeight: 700, marginTop: 18, marginBottom: 6 },
    intro: { fontSize: 8, lineHeight: 1.45 },
    table: { marginTop: 10, borderTopWidth: 1, borderColor: theme.colors.black },
    headRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: theme.colors.black,
        backgroundColor: "#FFFFFF",
    },
    bodyRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: theme.colors.line },
    colPos: { width: 34, paddingVertical: 6, paddingRight: 6, textAlign: "right" },
    colDesc: { flexGrow: 1, paddingVertical: 6, paddingRight: 10 },
    colQty: { width: 70, paddingVertical: 6, paddingRight: 6, textAlign: "right" },
    colUnit: { width: 90, paddingVertical: 6, paddingRight: 6, textAlign: "right" },
    colSum: { width: 95, paddingVertical: 6, textAlign: "right" },
    th: { fontWeight: 700 },
    descTitle: { fontWeight: 700, marginBottom: 2 },
    descSmall: { fontSize: 6, color: theme.colors.mute },
    totalsWrap: { marginTop: 14, width: "45%", alignSelf: "flex-end" },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    totalsKey: { color: theme.colors.text },
    totalsVal: { fontWeight: 700 },
    grandRow: { marginTop: 6, borderTopWidth: 1, borderColor: theme.colors.black, paddingTop: 6 },
    notesWrap: { marginTop: 16 },
    notesHead: { fontWeight: 700, marginBottom: 4 },
    notesText: { fontSize: 8, color: theme.colors.text },
    footerWrap: {
        position: "absolute",
        left: 40,
        right: 40,
        bottom: 20,
        borderTopWidth: 1,
        borderColor: theme.colors.line,
        paddingTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    footerCol: { width: "24%", fontSize: 6, lineHeight: 1.25, color: theme.colors.text },
    pageNum: { position: "absolute", right: 40, bottom: 8, fontSize: 8, color: theme.colors.mute },
});

/* ========== PDF COMPONENT ========== */
export default function CartOfferPDF({
    cartItems = [],
    totalPrice = 0,
    userNotes = "",
    logoSrc = "",
    vatRate = 0.19,
    b2bMode = true,

    /** Empfänger – wird von dir aus Firestore befüllt */
    customer = {
        company: "",
        name: "",
        street: "",
        city: "",
        country: "",
        customerNumber: "",
    },

    /** Meta – Standard: Angebot */
    docMeta = {
        type: "Angebot", // <-- Standard eindeutig Angebot
        number: "",
        reference: "",
        date: format(new Date(), "dd.MM.yyyy"),
        deliveryDate: "",
        validUntil: "", // <-- NEU: optional (z.B. "14.11.2025")
        contact: "MAINPLOTT Vertrieb",
    },
}) {
    // Summen
    const net = Number(totalPrice || 0);
    const vat = Math.round(net * vatRate * 100) / 100;
    const gross = Math.round((net + vat) * 100) / 100;

    // Empfängerzeilen
    const recipientLines = [
        safe(customer.company),
        safe(customer.name),
        safe(customer.street),
        safe(customer.city),
        safe(customer.country),
    ].filter(Boolean);

    // Positionen
    let posCounter = 0;
    const positionRows = [];
    cartItems.forEach((item) => {
        const { qty, unit, total, mixed } = summarizeProductLine(item);
        const title = item.productName || item.product?.productName || "Artikel";

        if (qty > 0 || total > 0) {
            posCounter += 1;
            positionRows.push({
                type: "product",
                pos: posCounter,
                title,
                desc: null,
                qty,
                unit: mixed || unit == null ? null : unit,
                total,
            });
        }
        const refinements = (item.refinements || []).filter((r) => r?.quantity > 0);
        refinements.forEach((r) => {
            const totalRef = Number.isFinite(r?.sum) ? Number(r.sum) : Number(r.quantity || 0) * Number(r.price || 0);
            posCounter += 1;
            positionRows.push({
                type: "ref",
                pos: posCounter,
                title: r.title || "Veredelung",
                desc: r.description || null,
                qty: r.quantity,
                unit: r.price,
                total: totalRef,
            });
        });
    });

    /* ========== RENDER ========== */
    return (
        <Document title={safe(docMeta.type, "Angebot")}>
            <Page size="A4" style={styles.page}>
                {/* Kopf */}
                <View style={styles.topRow}>
                    {logoSrc ? (
                        <Image src={logoSrc} style={styles.logo} />
                    ) : (
                        <Text style={{ fontSize: 22, fontWeight: 700 }}>MAINPLOTT</Text>
                    )}
                </View>

                <Text style={styles.senderLine}>Gack & Konhäuser GbR • Schießbergstraße 4 • 63303 Dreieich</Text>

                <View style={styles.spacer18} />

                {/* Anschrift & Meta */}
                <View style={styles.addressRow}>
                    <View style={styles.recipient}>
                        {recipientLines.length ? (
                            recipientLines.map((ln, i) => <Text key={i}>{ln}</Text>)
                        ) : (
                            <Text style={{ color: theme.colors.mute }}>Kundenadresse</Text>
                        )}
                    </View>

                    <View style={styles.metaRight}>
                        {safe(docMeta.number) ? (
                            <View style={styles.metaLine}>
                                <Text style={styles.metaKey}>
                                    {docMeta.type === "Rechnung" ? "Rechnungs-Nr." : "Angebots-Nr."}
                                </Text>
                                <Text style={styles.metaVal}>{safe(docMeta.number)}</Text>
                            </View>
                        ) : null}

                        <View style={styles.metaLine}>
                            <Text style={styles.metaKey}>
                                {docMeta.type === "Rechnung" ? "Rechnungsdatum" : "Datum"}
                            </Text>
                            <Text style={styles.metaVal}>{formatDate(docMeta.date)}</Text>
                        </View>

                        {safe(docMeta.deliveryDate) ? (
                            <View style={styles.metaLine}>
                                <Text style={styles.metaKey}>Lieferdatum</Text>
                                <Text style={styles.metaVal}>{formatDate(docMeta.deliveryDate)}</Text>
                            </View>
                        ) : null}

                        {safe(docMeta.validUntil) ? (
                            <View style={styles.metaLine}>
                                <Text style={styles.metaKey}>Gültig bis</Text>
                                <Text style={styles.metaVal}>{formatDate(docMeta.validUntil)}</Text>
                            </View>
                        ) : null}

                        {safe(customer.customerNumber) ? (
                            <View style={styles.metaLine}>
                                <Text style={styles.metaKey}>Ihre Kundennummer</Text>
                                <Text style={styles.metaVal}>{safe(customer.customerNumber)}</Text>
                            </View>
                        ) : null}

                        {safe(docMeta.contact) ? (
                            <View style={styles.metaLine}>
                                <Text style={styles.metaKey}>Ihr Ansprechpartner</Text>
                                <Text style={styles.metaVal}>{safe(docMeta.contact)}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                <View style={styles.spacer18} />

                {/* Titel */}
                <Text style={styles.title}>
                    {safe(docMeta.type, "Angebot")}
                    {safe(docMeta.number) ? ` Nr. ${docMeta.number}` : ""}
                    {safe(docMeta.reference) ? ` ${docMeta.reference}` : ""}
                </Text>

                {/* Einleitung – klar als Angebot */}
                <Text style={styles.intro}>
                    Sehr geehrte Damen und Herren,{`\n`}
                    vielen Dank für Ihre Anfrage und Ihr Interesse an unseren Produkten und Dienstleistungen.{`\n`}
                    Nachfolgend erhalten Sie unser Angebot. Preise verstehen sich, sofern nicht anders gekennzeichnet,
                    netto zzgl. gesetzlicher Umsatzsteuer.
                    {safe(docMeta.validUntil)
                        ? ` Dieses Angebot ist gültig bis ${formatDate(docMeta.validUntil)}.`
                        : ""}
                </Text>

                <View style={styles.spacer12} />

                {/* Tabelle */}
                <View style={styles.table}>
                    <View style={styles.headRow}>
                        <Text style={[styles.colPos, styles.th]}>Pos.</Text>
                        <Text style={[styles.colDesc, styles.th]}>Beschreibung</Text>
                        <Text style={[styles.colQty, styles.th]}>Menge</Text>
                        <Text style={[styles.colUnit, styles.th]}>Einzelpreis</Text>
                        <Text style={[styles.colSum, styles.th]}>Gesamtpreis</Text>
                    </View>

                    {positionRows.map((p) => (
                        <View key={`pos-${p.pos}`} style={styles.bodyRow}>
                            <Text style={styles.colPos}>{p.pos}.</Text>
                            <View style={styles.colDesc}>
                                <Text style={styles.descTitle}>{p.title}</Text>
                                {p.desc ? <Text style={styles.descSmall}>{p.desc}</Text> : null}
                            </View>
                            <Text style={styles.colQty}>{p.qty ? `${p.qty} Stk` : ""}</Text>
                            <Text style={styles.colUnit}>{p.unit == null ? "—" : currency(p.unit)}</Text>
                            <Text style={styles.colSum}>{currency(p.total)}</Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalsWrap}>
                    <View style={styles.totalsRow}>
                        <Text style={styles.totalsKey}>Zwischensumme (netto)</Text>
                        <Text style={styles.totalsVal}>{currency(net)}</Text>
                    </View>
                    <View style={styles.totalsRow}>
                        <Text style={styles.totalsKey}>USt. {Math.round(vatRate * 100)}%</Text>
                        <Text style={styles.totalsVal}>{currency(vat)}</Text>
                    </View>
                    <View style={[styles.totalsRow, styles.grandRow]}>
                        <Text style={styles.totalsKey}>Gesamtsumme (brutto)</Text>
                        <Text style={styles.totalsVal}>{currency(gross)}</Text>
                    </View>
                    {b2bMode ? (
                        <View style={{ marginTop: 4 }}>
                            <Text style={{ fontSize: 9, color: theme.colors.mute }}>
                                Hinweis: Für B2B-Kunden sind Nettopreise maßgeblich.
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Notizen */}
                {userNotes ? (
                    <View style={styles.notesWrap}>
                        <Text style={styles.notesHead}>Anmerkungen</Text>
                        <Text style={styles.notesText}>{userNotes}</Text>
                    </View>
                ) : null}

                {/* Footer */}
                <View style={styles.footerWrap} fixed>
                    <View style={styles.footerCol}>
                        <Text>Gack & Konhäuser GbR</Text>
                        <Text>MAINPLOTT</Text>
                        <Text>Schießbergstraße 4</Text>
                        <Text>63303 Dreieich</Text>
                        <Text>Deutschland</Text>
                    </View>
                    <View style={styles.footerCol}>
                        <Text>Tel. +49 178 / 3380649</Text>
                        <Text>E-Mail info@mainplott.de</Text>
                        <Text>Web www.mainplott.de</Text>
                    </View>
                    <View style={styles.footerCol}>
                        <Text>Steuer-Nr. 028 320 00182</Text>
                        <Text>Geschäftsführung Hr. Gack &</Text>
                        <Text>Fr. Konhäuser</Text>
                    </View>
                    <View style={styles.footerCol}>
                        <Text>Bank VR Bank Dreieich-Offenbach eG</Text>
                        <Text>IBAN DE71 5059 2200 0005 9451 27</Text>
                        <Text>BIC GENODE51DRE</Text>
                    </View>
                </View>

                <Text
                    style={styles.pageNum}
                    render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
}
