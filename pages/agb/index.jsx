import Head from "next/head";
import Link from "next/link";
export default function AGB() {
    return (
        <>
            <Head>
                <title>AGB | MainPlott</title>
                <meta name="description" content="Allgemeine Geschäftsbedingungen (AGB) von MainPlott" />
            </Head>

            <main className="max-w-screen-lg mx-auto px-4 py-8 font-body">
                <h1 className="text-2xl lg:text-4xl font-bold text-textColor mb-4">
                    Allgemeine Geschäftsbedingungen (AGB)
                </h1>
                <p className="text-sm text-gray-600 mb-6">Stand: 15. Januar 2025</p>

                <h2 className="text-xl font-semibold mt-8 mb-4">1. Geltungsbereich</h2>
                <p className="mb-4">
                    Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen, die Verbraucher und
                    Unternehmer (nachfolgend Kunden) über unseren Onlineshop unter{" "}
                    <a href="https://www.mainplott.de" className="text-primaryColor hover:underline">
                        www.mainplott.de
                    </a>
                    tätigen. Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die
                    überwiegend weder ihrer gewerblichen noch ihrer selbstständigen beruflichen Tätigkeit zugerechnet
                    werden können (§ 13 BGB). Unternehmer ist eine natürliche oder juristische Person oder eine
                    rechtsfähige Personengesellschaft, die bei Abschluss eines Rechtsgeschäfts in Ausübung ihrer
                    gewerblichen oder selbstständigen beruflichen Tätigkeit handelt (§ 14 BGB).
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">2. Vertragspartner</h2>
                <p className="mb-4">Der Kaufvertrag kommt zustande mit:</p>
                <p className="mb-4">
                    Gack & Konhäuser GbR
                    <br />
                    MAINPLOTT
                    <br />
                    Schießbergstr. 4<br />
                    63303 Dreieich
                    <br />
                    Deutschland
                    <br />
                    E-Mail:{" "}
                    <a href="mailto:info@mainplott.de" className="text-primaryColor hover:underline">
                        info@mainplott.de
                    </a>
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">3. Vertragsschluss</h2>
                <p className="mb-4">
                    Die Darstellung der Produkte im Onlineshop stellt kein rechtlich bindendes Angebot, sondern eine
                    Aufforderung zur Bestellung dar. Durch Anklicken des Buttons Zahlungspflichtig bestellen geben Sie
                    eine verbindliche Bestellung der im Warenkorb enthaltenen Waren ab. Die Bestätigung des Eingangs der
                    Bestellung erfolgt unmittelbar nach dem Absenden der Bestellung und stellt noch keine
                    Vertragsannahme dar. Wir können Ihre Bestellung durch Versand einer Auftragsbestätigung per E-Mail
                    oder durch Auslieferung der Ware innerhalb von 5 Tagen annehmen.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">4. Preise und Zahlungsbedingungen</h2>
                <p className="mb-4">
                    Die in unserem Onlineshop angegebenen Preise verstehen sich in Euro und beinhalten die gesetzliche
                    Mehrwertsteuer sowie sonstige Preisbestandteile. Zusätzlich zu den angegebenen Preisen können
                    Versandkosten anfallen, die in der Versandkostenübersicht angegeben sind. Die Bezahlung erfolgt
                    wahlweise per PayPal, Kreditkarte, oder einer der anderen im Bestellprozess angebotenen
                    Zahlungsmethoden.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">5. Lieferung und Versand</h2>
                <p className="mb-4">
                    Die Lieferung erfolgt an die von Ihnen angegebene Lieferadresse. Die Lieferzeit beträgt, sofern
                    nicht anders angegeben, 3–7 Werktage. Sollten nicht alle bestellten Produkte vorrätig sein, sind wir
                    zu Teillieferungen auf unsere Kosten berechtigt, soweit dies für Sie zumutbar ist.
                </p>
                <p className="mb-4">
                    Sollten wir aufgrund höherer Gewalt (z. B. Naturkatastrophen) oder anderer unvorhersehbarer
                    Ereignisse nicht liefern können, informieren wir Sie unverzüglich und erstatten ggf. bereits
                    geleistete Zahlungen.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">6. Widerrufsrecht</h2>
                <p className="mb-4">
                    Verbrauchern steht das gesetzliche Widerrufsrecht zu. Details dazu finden Sie in unserer
                    <Link href="/widerruf" className="text-primaryColor hover:underline">
                        Widerrufsbelehrung
                    </Link>
                    . Bitte beachten Sie, dass das Widerrufsrecht für individuell gestaltete Produkte, die nach Ihren
                    Wünschen angefertigt werden, ausgeschlossen ist (§ 312g Abs. 2 Nr. 1 BGB).
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">7. Eigentumsvorbehalt</h2>
                <p className="mb-4">
                    Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum. Für Unternehmer gilt zusätzlich: Wir
                    behalten uns das Eigentum an der Ware bis zur vollständigen Begleichung aller Forderungen aus einer
                    laufenden Geschäftsbeziehung vor. Sie dürfen die Vorbehaltsware im ordentlichen Geschäftsbetrieb
                    weiterveräußern; sämtliche aus diesem Weiterverkauf entstehenden Forderungen treten Sie – unabhängig
                    von einer Verbindung oder Vermischung der Vorbehaltsware mit einer neuen Sache – in Höhe des
                    Rechnungsbetrages an uns im Voraus ab, und wir nehmen diese Abtretung an.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">8. Gewährleistung und Haftung</h2>
                <p className="mb-4">
                    Es gelten die gesetzlichen Gewährleistungsrechte. Für Verbraucher beträgt die Gewährleistungsfrist 2
                    Jahre ab Lieferung der Ware. Für Unternehmer gilt: Die Gewährleistungsfrist beträgt 1 Jahr ab
                    Lieferung der Ware. Von der Verkürzung der Gewährleistungsfrist ausgenommen sind Ansprüche wegen
                    Schäden, die aus der Verletzung des Lebens, des Körpers oder der Gesundheit resultieren, sowie bei
                    Vorsatz oder grober Fahrlässigkeit.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">9. Streitbeilegung</h2>
                <p className="mb-4">
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die Sie
                    unter
                    <a href="https://ec.europa.eu/consumers/odr" className="text-primaryColor hover:underline">
                        https://ec.europa.eu/consumers/odr
                    </a>{" "}
                    finden. Wir sind bereit, an einem außergerichtlichen Schlichtungsverfahren teilzunehmen.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">10. Schlussbestimmungen</h2>
                <p className="mb-4">
                    Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, so bleibt die Wirksamkeit der
                    übrigen Bestimmungen unberührt. Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss
                    des UN-Kaufrechts.
                </p>
            </main>
        </>
    );
}
