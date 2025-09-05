"use client";
import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { format } from "date-fns";

/* ---- CI Setup ---- */
const theme = {
    colors: {
        primary: "#bb969d",
        primary700: "#7b5560",
        accent: "#F3EEC3",
        text: "#393836",
        bg: "#F9F9F9",
        line: "#eee",
        mute: "#666",
    },
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

const currency = (n) => `€${Number(n || 0).toFixed(2)}`;

const styles = StyleSheet.create({
    page: {
        padding: 28,
        fontSize: 11,
        fontFamily: theme.fonts.body,
        color: theme.colors.text,
        backgroundColor: theme.colors.bg,
    },
    header: {
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderStyle: "solid",
        borderRadius: 8,
        padding: 12,
        marginBottom: 14,
    },
    headerRow: { flexDirection: "row" },
    brandWrap: { flexGrow: 1 },
    brand: { fontFamily: theme.fonts.headline, fontSize: 28, lineHeight: 1.0, color: theme.colors.primary700 },
    tagline: { fontSize: 10, color: theme.colors.primary700, marginTop: 2 },
    contact: { fontSize: 10, textAlign: "right" },
    h1: {
        fontFamily: theme.fonts.headline,
        fontSize: 18,
        marginTop: 10,
        marginBottom: 6,
        color: theme.colors.primary700,
    },
    sub: { color: theme.colors.mute, marginBottom: 10 },
    item: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.line,
        borderTopStyle: "solid",
        paddingTop: 10,
        marginTop: 10,
    },
    itemHeader: { flexDirection: "row", marginBottom: 6 },
    thumb: { width: 56, height: 56, borderRadius: 4, backgroundColor: "#f2f2f2" },
    itemMeta: { marginLeft: 8 },
    itemTitle: { fontSize: 12, fontWeight: 700 },
    muted: { color: theme.colors.mute, marginTop: 2 },
    table: { marginTop: 6, borderWidth: 1, borderColor: theme.colors.line, borderStyle: "solid", borderRadius: 6 },
    row: { flexDirection: "row", alignItems: "center" },
    rowHeader: {
        backgroundColor: theme.colors.accent,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.line,
        borderBottomStyle: "solid",
    },
    cell: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderLeftWidth: 1,
        borderLeftColor: theme.colors.line,
        borderLeftStyle: "solid",
    },
    cellFirst: { borderLeftWidth: 0 },
    colName: { flexGrow: 6, flexBasis: 0 },
    colQty: { flexGrow: 2, flexBasis: 0 },
    colUnit: { flexGrow: 3, flexBasis: 0 },
    colSum: { flexGrow: 3, flexBasis: 0 },
    cellRight: { alignItems: "flex-end" },
    cellText: { lineHeight: 1.25 },
    cellHead: { fontWeight: 700 },
    itemTotal: { marginTop: 6, textAlign: "right", fontWeight: 700 },
    notes: { marginTop: 10, padding: 8, backgroundColor: "#fafafa", borderRadius: 6 },
    footerTotal: { marginTop: 14, textAlign: "right", fontSize: 14, fontWeight: 700, color: theme.colors.primary700 },
    totalsBlock: {
        marginTop: 8,
        padding: 8,
        backgroundColor: "#fff",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: theme.colors.line,
    },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    savings: { color: "#0f7f5f", fontWeight: 700 },
    footer: { position: "absolute", bottom: 20, left: 28, right: 28, fontSize: 9, color: theme.colors.mute },
});

const lineRow = (left, qty, unit, sum, key) => (
    <View key={key} style={styles.row}>
        <View style={[styles.cell, styles.cellFirst, styles.colName]}>
            <Text style={styles.cellText}>{left}</Text>
        </View>
        <View style={[styles.cell, styles.colQty, styles.cellRight]}>
            <Text style={styles.cellText}>{qty}</Text>
        </View>
        <View style={[styles.cell, styles.colUnit, styles.cellRight]}>
            <Text style={styles.cellText}>{currency(unit)}</Text>
        </View>
        <View style={[styles.cell, styles.colSum, styles.cellRight]}>
            <Text style={styles.cellText}>{currency(sum)}</Text>
        </View>
    </View>
);

export default function CartOfferPDF({
    cartItems = [],
    totalPrice = 0,
    userNotes = "",
    logoSrc = "",
    vatRate = 0.2,
    b2bMode = true,
}) {
    const now = format(new Date(), "dd.MM.yyyy HH:mm");
    const net = Number(totalPrice || 0);
    const vat = net * vatRate;
    const gross = net + vat;

    return (
        <Document title="Warenkorb-Angebot">
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <View style={styles.brandWrap}>
                            {logoSrc ? (
                                <Image src={logoSrc} style={{ width: 140, height: 28 }} />
                            ) : (
                                <>
                                    <Text style={styles.brand}>MAINPLOTT</Text>
                                    <Text style={styles.tagline}>Individuelle Textilveredelung & Workwear</Text>
                                </>
                            )}
                        </View>
                        <View>
                            <Text style={styles.contact}>MAINPLOTT</Text>
                            <Text style={styles.contact}>Schießbergstr. 4 · 63303 Dreieich</Text>
                            <Text style={styles.contact}>info@mainplott.de · +49 174 3177690</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.h1}>Angebot / Warenkorb</Text>
                <Text style={styles.sub}>Stand: {now}</Text>

                {/* Items */}
                {cartItems.map((item, idx) => {
                    const img =
                        item.design?.front?.downloadURL ||
                        item.design?.back?.downloadURL ||
                        item.selectedImage ||
                        item.product?.images?.edges?.[0]?.node?.originalSrc ||
                        "";

                    // Varianten-Zeilen
                    const variantRows = [];
                    if (item.variants) {
                        Object.entries(item.variants)
                            .filter(([_, v]) => v?.quantity > 0)
                            .forEach(([title, v]) => {
                                variantRows.push(
                                    lineRow(title, v.quantity, v.price, v.quantity * v.price, `var-${title}`)
                                );
                            });
                    }

                    const rows = [];
                    if (item.variants) {
                        Object.entries(item.variants)
                            .filter(([k, v]) => v?.quantity > 0 && k !== "frontVeredelung" && k !== "backVeredelung")
                            .forEach(([title, v]) => {
                                rows.push(lineRow(title, v.quantity, v.price, v.quantity * v.price, `size-${title}`));
                            });
                    }

                    // ✅ Veredelungs-Zeilen (neu)
                    const refineRows = (item.refinements || [])
                        .filter((r) => r?.quantity > 0)
                        .map((r, i) => lineRow(r.title, r.quantity, r.price, r.quantity * r.price, `ref-${i}`));

                    return (
                        <View key={item.id || idx} style={styles.item}>
                            <View style={styles.itemHeader}>
                                {img ? <Image style={styles.thumb} src={img} /> : <View style={styles.thumb} />}
                                <View style={styles.itemMeta}>
                                    <Text style={styles.itemTitle}>
                                        {item.productName || item.product?.productName}
                                    </Text>
                                </View>
                            </View>

                            {/* Varianten-Tabelle */}
                            {variantRows.length > 0 && (
                                <View style={styles.table}>
                                    <View style={[styles.row, styles.rowHeader]}>
                                        <View style={[styles.cell, styles.cellFirst, styles.colName]}>
                                            <Text style={[styles.cellText, styles.cellHead]}>Variante</Text>
                                        </View>
                                        <View style={[styles.cell, styles.colQty, styles.cellRight]}>
                                            <Text style={[styles.cellText, styles.cellHead]}>Menge</Text>
                                        </View>
                                        <View style={[styles.cell, styles.colUnit, styles.cellRight]}>
                                            <Text style={[styles.cellText, styles.cellHead]}>Einzelpreis</Text>
                                        </View>
                                        <View style={[styles.cell, styles.colSum, styles.cellRight]}>
                                            <Text style={[styles.cellText, styles.cellHead]}>Zwischensumme</Text>
                                        </View>
                                    </View>
                                    {variantRows}
                                </View>
                            )}

                            {/* ✅ Veredelungen-Tabelle */}
                            {refineRows.length > 0 && (
                                <View style={[styles.table, { marginTop: 8 }]}>
                                    <View style={[styles.row, styles.rowHeader]}>
                                        <View style={[styles.cell, styles.cellFirst, styles.colName]}>
                                            <Text style={[styles.cellText, styles.cellHead]}>Veredelung</Text>
                                        </View>
                                        <View style={[styles.cell, styles.colQty, styles.cellRight]}>
                                            <Text style={[styles.cellText, styles.cellHead]}>Menge</Text>
                                        </View>
                                        <View style={[styles.cell, styles.colUnit, styles.cellRight]}>
                                            <Text style={[styles.cellText, styles.cellHead]}>Einzelpreis</Text>
                                        </View>
                                        <View style={[styles.cell, styles.colSum, styles.cellRight]}>
                                            <Text style={[styles.cellText, styles.cellHead]}>Zwischensumme</Text>
                                        </View>
                                    </View>
                                    {refineRows}
                                </View>
                            )}

                            <Text style={styles.itemTotal}>Positionssumme: {currency(item.totalPrice)}</Text>
                        </View>
                    );
                })}

                {userNotes ? (
                    <View style={styles.notes}>
                        <Text>Anmerkungen</Text>
                        <Text>{userNotes}</Text>
                    </View>
                ) : null}

                {/* Totals */}
                <View style={styles.totalsBlock}>
                    <View style={styles.totalsRow}>
                        <Text>Summe netto (B2B)</Text>
                        <Text>{currency(net)}</Text>
                    </View>
                    <View style={styles.totalsRow}>
                        <Text>USt. {Math.round(vatRate * 100)}% (hypothetisch für Privatkunden)</Text>
                        <Text>{currency(vat)}</Text>
                    </View>
                    <View style={styles.totalsRow}>
                        <Text>Brutto (hypothetisch, Privatkunde)</Text>
                        <Text>{currency(gross)}</Text>
                    </View>
                    {b2bMode && (
                        <View style={styles.totalsRow}>
                            <Text style={styles.savings}>USt.-Ersparnis (B2B)</Text>
                            <Text style={styles.savings}>−{currency(vat)}</Text>
                        </View>
                    )}
                </View>

                <Text
                    style={styles.footer}
                    render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages} · mainplott.de`}
                    fixed
                />
            </Page>
        </Document>
    );
}
