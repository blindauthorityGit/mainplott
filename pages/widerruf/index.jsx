import Head from "next/head";

export default function Widerruf() {
    return (
        <>
            <Head>
                <title>Widerrufsbelehrung | MainPlott</title>
                <meta name="description" content="Widerrufsbelehrung von MainPlott" />
            </Head>

            <main className="max-w-screen-lg mx-auto px-4 py-8 font-body">
                <h1 className="text-2xl lg:text-4xl font-bold text-textColor mb-4">Widerrufsbelehrung</h1>
                <p className="text-sm text-gray-600 mb-6">Stand: 15. Januar 2025</p>

                <h2 className="text-xl font-semibold mt-8 mb-4">1. Widerrufsrecht</h2>
                <p className="mb-4">
                    Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
                </p>
                <p className="mb-4">Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag,</p>
                <ul className="list-disc ml-5 mb-4">
                    <li>
                        an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in
                        Besitz genommen haben bzw. hat, wenn Sie eine Ware oder mehrere Waren im Rahmen einer
                        einheitlichen Bestellung bestellt haben und diese einheitlich geliefert wird;
                    </li>
                    <li>
                        an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die letzte Ware
                        in Besitz genommen haben bzw. hat, wenn Sie mehrere Waren im Rahmen einer einheitlichen
                        Bestellung bestellt haben und diese getrennt geliefert werden.
                    </li>
                </ul>

                <p className="mb-4">
                    Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (MainPlott, Christian Gack, Schießbergstr. 4, 63303
                    Dreieich, E-Mail:{" "}
                    <a href="mailto:info@mainplott.de" className="text-primaryColor hover:underline">
                        info@mainplott.de
                    </a>
                    ) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail)
                    über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte
                    Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
                </p>
                <p className="mb-4">
                    Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des
                    Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">2. Folgen des Widerrufs</h2>
                <p className="mb-4">
                    Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten
                    haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus
                    ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste
                    Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
                    zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
                </p>
                <p className="mb-4">
                    Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen
                    Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in
                    keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
                </p>
                <p className="mb-4">
                    Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie
                    den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere
                    Zeitpunkt ist.
                </p>
                <p className="mb-4">
                    Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an
                    dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben.
                    Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.
                </p>
                <p className="mb-4">Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.</p>
                <p className="mb-4">
                    Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen
                    zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang
                    mit ihnen zurückzuführen ist.
                </p>

                <h2 className="text-xl font-semibold mt-8 mb-4">
                    3. Ausschluss bzw. vorzeitiges Erlöschen des Widerrufsrechts
                </h2>
                <p className="mb-4">Das Widerrufsrecht besteht nicht bei Verträgen:</p>
                <ul className="list-disc ml-5 mb-4">
                    <li>
                        zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle
                        Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist oder die eindeutig auf die
                        persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind;
                    </li>
                    <li>
                        zur Lieferung von Waren, die schnell verderben können oder deren Verfallsdatum schnell
                        überschritten würde;
                    </li>
                    <li>
                        zur Lieferung versiegelter Waren, die aus Gründen des Gesundheitsschutzes oder der Hygiene nicht
                        zur Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde;
                    </li>
                    <li>
                        zur Lieferung von Ton- oder Videoaufnahmen oder Computersoftware in einer versiegelten Packung,
                        wenn die Versiegelung nach der Lieferung entfernt wurde.
                    </li>
                </ul>

                <h2 className="text-xl font-semibold mt-8 mb-4">4. Muster-Widerrufsformular</h2>
                <p className="mb-4">
                    Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es
                    zurück an:
                </p>
                <p className="mb-4">
                    Gack & Konhäuser GbR
                    <br />
                    Mainplott
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
                <p className="mb-4">
                    <strong>Muster-Widerrufsformular:</strong>
                </p>
                <p className="mb-4">
                    <em>
                        Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der
                        folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*):
                        <br />
                        Bestellt am (*) / erhalten am (*):
                        <br />
                        Name des/der Verbraucher(s):
                        <br />
                        Anschrift des/der Verbraucher(s):
                        <br />
                        Datum:
                        <br />
                        Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):
                        <br />
                        (*) Unzutreffendes streichen.
                    </em>
                </p>
            </main>
        </>
    );
}
