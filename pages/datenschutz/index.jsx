import Head from "next/head";

export default function Datenschutz() {
    return (
        <>
            <Head>
                <title>Datenschutzerklärung | MainPlott</title>
                <meta name="description" content="Datenschutzerklärung von MainPlott" />
            </Head>

            <main className="max-w-screen-lg mx-auto px-4 py-8 font-body">
                {/* Title and Date */}
                <h1 className="text-2xl lg:text-4xl font-bold text-textColor mb-2">Datenschutzerklärung</h1>
                <p className="text-sm text-gray-600 mb-4">Stand: 15. Januar 2025</p>

                {/* Inhaltsübersicht */}
                <h2 className="text-xl lg:text-2xl font-semibold mt-6 mb-2">Inhaltsübersicht</h2>
                <ul className="list-disc ml-5 space-y-1 text-sm lg:text-base text-primaryColor-700">
                    <li>
                        <a href="#m3" className="hover:text-primaryColor">
                            Verantwortlicher
                        </a>
                    </li>
                    <li>
                        <a href="#mOverview" className="hover:text-primaryColor">
                            Übersicht der Verarbeitungen
                        </a>
                    </li>
                    <li>
                        <a href="#m2427" className="hover:text-primaryColor">
                            Maßgebliche Rechtsgrundlagen
                        </a>
                    </li>
                    <li>
                        <a href="#m27" className="hover:text-primaryColor">
                            Sicherheitsmaßnahmen
                        </a>
                    </li>
                    <li>
                        <a href="#m25" className="hover:text-primaryColor">
                            Übermittlung von personenbezogenen Daten
                        </a>
                    </li>
                    <li>
                        <a href="#m24" className="hover:text-primaryColor">
                            Internationale Datentransfers
                        </a>
                    </li>
                    <li>
                        <a href="#m12" className="hover:text-primaryColor">
                            Allgemeine Informationen zur Datenspeicherung und Löschung
                        </a>
                    </li>
                    <li>
                        <a href="#m10" className="hover:text-primaryColor">
                            Rechte der betroffenen Personen
                        </a>
                    </li>
                    <li>
                        <a href="#m317" className="hover:text-primaryColor">
                            Geschäftliche Leistungen
                        </a>
                    </li>
                    <li>
                        <a href="#m225" className="hover:text-primaryColor">
                            Bereitstellung des Onlineangebots und Webhosting
                        </a>
                    </li>
                    <li>
                        <a href="#m134" className="hover:text-primaryColor">
                            Einsatz von Cookies
                        </a>
                    </li>
                    <li>
                        <a href="#m182" className="hover:text-primaryColor">
                            Kontakt- und Anfrageverwaltung
                        </a>
                    </li>
                    <li>
                        <a href="#m17" className="hover:text-primaryColor">
                            Newsletter und elektronische Benachrichtigungen
                        </a>
                    </li>
                    <li>
                        <a href="#m263" className="hover:text-primaryColor">
                            Webanalyse, Monitoring und Optimierung
                        </a>
                    </li>
                    <li>
                        <a href="#m136" className="hover:text-primaryColor">
                            Präsenzen in sozialen Netzwerken (Social Media)
                        </a>
                    </li>
                    <li>
                        <a href="#m328" className="hover:text-primaryColor">
                            Plug-ins und eingebettete Funktionen sowie Inhalte
                        </a>
                    </li>
                </ul>

                {/* Verantwortlicher */}
                <h2 id="m3" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Verantwortlicher
                </h2>
                <p className="mb-2">
                    MAINPLOTT
                    <br />
                    Christian Gack
                    <br />
                    Schießbergstr. 4,
                    <br />
                    63303 Dreieich
                </p>
                <p className="mb-2">Vertretungsberechtigte Personen: Christian Gack</p>
                <p className="mb-4">
                    E-Mail-Adresse:{" "}
                    <a href="mailto:info@mainplott.de" className="text-primaryColor hover:underline">
                        info@mainplott.de
                    </a>
                </p>

                {/* Übersicht der Verarbeitungen */}
                <h2 id="mOverview" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Übersicht der Verarbeitungen
                </h2>
                <p className="mb-2">
                    Die nachfolgende Übersicht fasst die Arten der verarbeiteten Daten und die Zwecke ihrer Verarbeitung
                    zusammen und verweist auf die betroffenen Personen.
                </p>
                <h3 className="text-lg font-semibold mt-6 mb-2">Arten der verarbeiteten Daten</h3>
                <ul className="list-disc ml-5 space-y-1 mb-4">
                    <li>Bestandsdaten.</li>
                    <li>Zahlungsdaten.</li>
                    <li>Kontaktdaten.</li>
                    <li>Inhaltsdaten.</li>
                    <li>Vertragsdaten.</li>
                    <li>Nutzungsdaten.</li>
                    <li>Meta-, Kommunikations- und Verfahrensdaten.</li>
                    <li>Protokolldaten.</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-2">Kategorien betroffener Personen</h3>
                <ul className="list-disc ml-5 space-y-1 mb-4">
                    <li>Leistungsempfänger und Auftraggeber.</li>
                    <li>Interessenten.</li>
                    <li>Kommunikationspartner.</li>
                    <li>Nutzer.</li>
                    <li>Geschäfts- und Vertragspartner.</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-2">Zwecke der Verarbeitung</h3>
                <ul className="list-disc ml-5 space-y-1 mb-4">
                    <li>Erbringung vertraglicher Leistungen und Erfüllung vertraglicher Pflichten.</li>
                    <li>Kommunikation.</li>
                    <li>Sicherheitsmaßnahmen.</li>
                    <li>Direktmarketing.</li>
                    <li>Reichweitenmessung.</li>
                    <li>Büro- und Organisationsverfahren.</li>
                    <li>Organisations- und Verwaltungsverfahren.</li>
                    <li>Feedback.</li>
                    <li>Profile mit nutzerbezogenen Informationen.</li>
                    <li>Bereitstellung unseres Onlineangebotes und Nutzerfreundlichkeit.</li>
                    <li>Informationstechnische Infrastruktur.</li>
                    <li>Öffentlichkeitsarbeit.</li>
                    <li>Geschäftsprozesse und betriebswirtschaftliche Verfahren.</li>
                </ul>

                {/* Maßgebliche Rechtsgrundlagen */}
                <h2 id="m2427" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Maßgebliche Rechtsgrundlagen
                </h2>
                <p className="mb-4">
                    <strong>Maßgebliche Rechtsgrundlagen nach der DSGVO: </strong>
                    Im Folgenden erhalten Sie eine Übersicht der Rechtsgrundlagen der DSGVO, auf deren Basis wir
                    personenbezogene Daten verarbeiten. Bitte nehmen Sie zur Kenntnis, dass neben den Regelungen der
                    DSGVO nationale Datenschutzvorgaben in Ihrem bzw. unserem Wohn- oder Sitzland gelten können. Sollten
                    ferner im Einzelfall speziellere Rechtsgrundlagen maßgeblich sein, teilen wir Ihnen diese in der
                    Datenschutzerklärung mit.
                </p>
                <ul className="list-disc ml-5 mb-4 space-y-1">
                    <li>
                        <strong>Einwilligung (Art. 6 Abs. 1 S. 1 lit. a) DSGVO)</strong> – Die betroffene Person hat
                        ihre Einwilligung in die Verarbeitung der sie betreffenden personenbezogenen Daten für einen
                        spezifischen Zweck oder mehrere bestimmte Zwecke gegeben.
                    </li>
                    <li>
                        <strong>
                            Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1 S. 1 lit. b) DSGVO)
                        </strong>{" "}
                        – Die Verarbeitung ist für die Erfüllung eines Vertrags, dessen Vertragspartei die betroffene
                        Person ist, oder zur Durchführung vorvertraglicher Maßnahmen erforderlich, die auf Anfrage der
                        betroffenen Person erfolgen.
                    </li>
                    <li>
                        <strong>Rechtliche Verpflichtung (Art. 6 Abs. 1 S. 1 lit. c) DSGVO)</strong> – Die Verarbeitung
                        ist zur Erfüllung einer rechtlichen Verpflichtung erforderlich, der der Verantwortliche
                        unterliegt.
                    </li>
                    <li>
                        <strong>Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO)</strong> – die Verarbeitung
                        ist zur Wahrung der berechtigten Interessen des Verantwortlichen oder eines Dritten notwendig,
                        vorausgesetzt, dass die Interessen, Grundrechte und Grundfreiheiten der betroffenen Person, die
                        den Schutz personenbezogener Daten verlangen, nicht überwiegen.
                    </li>
                </ul>
                <p className="mb-2">
                    <strong>Nationale Datenschutzregelungen in Deutschland: </strong>
                    Zusätzlich zu den Datenschutzregelungen der DSGVO gelten nationale Regelungen zum Datenschutz in
                    Deutschland. [...]
                </p>
                <p className="mb-4">
                    <strong>Hinweis auf Geltung DSGVO und Schweizer DSG: </strong>Diese Datenschutzhinweise dienen
                    sowohl der Informationserteilung nach dem Schweizer DSG als auch nach der DSGVO. [...]
                </p>

                {/* Sicherheitsmaßnahmen */}
                <h2 id="m27" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Sicherheitsmaßnahmen
                </h2>
                <p className="mb-4">
                    Wir treffen nach Maßgabe der gesetzlichen Vorgaben unter Berücksichtigung des Stands der Technik,
                    [...]
                </p>
                <p className="mb-4">
                    Sicherung von Online-Verbindungen durch TLS-/SSL-Verschlüsselungstechnologie (HTTPS): [...]
                </p>

                {/* Übermittlung von personenbezogenen Daten */}
                <h2 id="m25" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Übermittlung von personenbezogenen Daten
                </h2>
                <p className="mb-4">
                    Im Rahmen unserer Verarbeitung von personenbezogenen Daten kommt es vor, dass diese an andere
                    Stellen, [...]
                </p>

                {/* Internationale Datentransfers */}
                <h2 id="m24" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Internationale Datentransfers
                </h2>
                <p className="mb-4">
                    Datenverarbeitung in Drittländern: Sofern wir Daten in einem Drittland (d. h., außerhalb der
                    Europäischen Union (EU), [...]
                </p>

                {/* Allgemeine Informationen zur Datenspeicherung und Löschung */}
                <h2 id="m12" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Allgemeine Informationen zur Datenspeicherung und Löschung
                </h2>
                <p className="mb-2">
                    Wir löschen personenbezogene Daten, die wir verarbeiten, gemäß den gesetzlichen Bestimmungen, [...]
                </p>
                <p className="mb-2">
                    Insbesondere müssen Daten, die aus handels- oder steuerrechtlichen Gründen aufbewahrt werden müssen
                    [...]
                </p>
                <p className="mb-2">
                    Unsere Datenschutzhinweise enthalten zusätzliche Informationen zur Aufbewahrung und Löschung von
                    Daten, [...]
                </p>
                <p className="mb-2">
                    Bei mehreren Angaben zur Aufbewahrungsdauer oder Löschungsfristen eines Datums, ist stets die
                    längste Frist maßgeblich.
                </p>
                <p className="mb-2">
                    Beginnt eine Frist nicht ausdrücklich zu einem bestimmten Datum und beträgt sie mindestens ein Jahr,
                    [...]
                </p>
                <p className="mb-4">
                    Daten, die nicht mehr für den ursprünglich vorgesehenen Zweck, sondern aufgrund gesetzlicher
                    Vorgaben oder [...]
                </p>
                <p className="mb-4 font-semibold">
                    Weitere Hinweise zu Verarbeitungsprozessen, Verfahren und Diensten:
                </p>
                <ul className="list-disc ml-5 mb-4 space-y-2">
                    <li>
                        <strong>Aufbewahrung und Löschung von Daten: </strong>
                        [...]
                        <ul className="list-disc ml-5 space-y-2 mt-2">
                            <li>
                                10 Jahre - Aufbewahrungsfrist für Bücher und Aufzeichnungen, Jahresabschlüsse, [...]
                            </li>
                            <li>8 Jahre - Buchungsbelege, wie z. B. Rechnungen und Kostenbelege [...]</li>
                            <li>
                                6 Jahre - Übrige Geschäftsunterlagen: empfangene Handels- oder Geschäftsbriefe [...]
                            </li>
                            <li>
                                3 Jahre - Daten, die erforderlich sind, um potenzielle Gewährleistungs- und
                                Schadensersatzansprüche [...]
                            </li>
                        </ul>
                    </li>
                </ul>

                {/* Rechte der betroffenen Personen */}
                <h2 id="m10" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Rechte der betroffenen Personen
                </h2>
                <p className="mb-4">
                    Rechte der betroffenen Personen aus der DSGVO: Ihnen stehen als Betroffene nach der DSGVO
                    verschiedene Rechte [...]
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Widerspruchsrecht: </strong>Sie haben das Recht, [...]
                    </li>
                    <li>
                        <strong>Widerrufsrecht bei Einwilligungen:</strong> Sie haben das Recht, [...]
                    </li>
                    <li>
                        <strong>Auskunftsrecht:</strong> Sie haben das Recht, [...]
                    </li>
                    <li>
                        <strong>Recht auf Berichtigung:</strong> Sie haben entsprechend den gesetzlichen [...]
                    </li>
                    <li>
                        <strong>Recht auf Löschung und Einschränkung der Verarbeitung:</strong> [...]
                    </li>
                    <li>
                        <strong>Recht auf Datenübertragbarkeit:</strong> [...]
                    </li>
                    <li>
                        <strong>Beschwerde bei Aufsichtsbehörde:</strong> [...]
                    </li>
                </ul>

                {/* Geschäftliche Leistungen */}
                <h2 id="m317" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Geschäftliche Leistungen
                </h2>
                <p className="mb-4">
                    Wir verarbeiten Daten unserer Vertrags- und Geschäftspartner, z. B. Kunden und Interessenten
                    (zusammenfassend [...]
                </p>
                <p className="mb-4">
                    Welche Daten für die vorgenannten Zwecke erforderlich sind, teilen wir den Vertragspartnern vor
                    [...]
                </p>
                <ul className="list-disc ml-5 mb-4 space-y-2">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Bestandsdaten, [...]
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Leistungsempfänger und Auftraggeber [...]
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Erbringung vertraglicher Leistungen [...]
                    </li>
                    <li>
                        <strong>Aufbewahrung und Löschung:</strong> Löschung entsprechend Angaben im Abschnitt [...]
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Vertragserfüllung und vorvertragliche Anfragen [...]
                    </li>
                </ul>
                <p className="mb-2 font-semibold">
                    Weitere Hinweise zu Verarbeitungsprozessen, Verfahren und Diensten:
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Onlineshop, Bestellformulare, E-Commerce und Auslieferung: </strong>Wir verarbeiten die
                        Daten unserer Kunden, um ihnen die Auswahl [...]
                    </li>
                </ul>

                {/* Bereitstellung des Onlineangebots und Webhosting */}
                <h2 id="m225" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Bereitstellung des Onlineangebots und Webhosting
                </h2>
                <p className="mb-4">
                    Wir verarbeiten die Daten der Nutzer, um ihnen unsere Online-Dienste zur Verfügung stellen zu können
                    [...]
                </p>
                <ul className="list-disc ml-5 mb-4 space-y-2">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Nutzungsdaten, Meta-, Kommunikations- [...]
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Nutzer
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Bereitstellung unseres Onlineangebotes [...]
                    </li>
                    <li>
                        <strong>Aufbewahrung und Löschung:</strong> [...]
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO).
                    </li>
                </ul>
                <p className="mb-2 font-semibold">
                    Weitere Hinweise zu Verarbeitungsprozessen, Verfahren und Diensten:
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Bereitstellung Onlineangebot auf gemietetem Speicherplatz:</strong> [...]
                    </li>
                    <li>
                        <strong>Erhebung von Zugriffsdaten und Logfiles:</strong> [...]
                    </li>
                    <li>
                        <strong>E-Mail-Versand und -Hosting:</strong> [...]
                    </li>
                    <li>
                        <strong>Content-Delivery-Network:</strong> [...]
                    </li>
                    <li>
                        <strong>Instart:</strong> Content-Delivery-Network (CDN) [...]
                    </li>
                </ul>

                {/* Einsatz von Cookies */}
                <h2 id="m134" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Einsatz von Cookies
                </h2>
                <p className="mb-4">
                    Unter dem Begriff Cookies werden Funktionen, die Informationen auf Endgeräten der Nutzer speichern
                    [...]
                </p>
                <p className="mb-4">
                    <strong>Hinweise zu datenschutzrechtlichen Rechtsgrundlagen: </strong>Ob wir personenbezogene Daten
                    mithilfe [...]
                </p>
                <p className="mb-4">
                    <strong>Speicherdauer: </strong>Im Hinblick auf die Speicherdauer werden die folgenden Arten von
                    Cookies unterschieden:
                </p>
                <ul className="list-disc ml-5 space-y-1 mb-4">
                    <li>
                        <strong>Temporäre Cookies (auch: Session- oder Sitzungscookies):</strong> [...]
                    </li>
                    <li>
                        <strong>Permanente Cookies:</strong> [...]
                    </li>
                </ul>
                <p className="mb-4">
                    <strong>Allgemeine Hinweise zum Widerruf und Widerspruch (Opt-out): </strong>Nutzer können die von
                    ihnen abgegebenen Einwilligungen [...]
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Meta-, Kommunikations- und Verfahrensdaten [...]
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Nutzer
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Berechtigte Interessen / Einwilligung
                    </li>
                </ul>
                <p className="mb-2 font-semibold">
                    Weitere Hinweise zu Verarbeitungsprozessen, Verfahren und Diensten:
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitung von Cookie-Daten auf Grundlage einer Einwilligung:</strong> [...]
                    </li>
                </ul>

                {/* Kontakt- und Anfrageverwaltung */}
                <h2 id="m182" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Kontakt- und Anfrageverwaltung
                </h2>
                <p className="mb-4">
                    Bei der Kontaktaufnahme mit uns (z. B. per Post, Kontaktformular, E-Mail, Telefon oder via soziale
                    Medien) [...]
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Bestandsdaten, Kontaktdaten, Inhaltsdaten [...]
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Kommunikationspartner
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Kommunikation; Organisations- und Verwaltungsverfahren
                        [...]
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Berechtigte Interessen / Vertragserfüllung [...]
                    </li>
                </ul>
                <p className="mb-2 font-semibold">Weitere Hinweise:</p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Kontaktformular:</strong> [...]
                    </li>
                </ul>

                {/* Newsletter */}
                <h2 id="m17" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Newsletter und elektronische Benachrichtigungen
                </h2>
                <p className="mb-4">
                    Wir versenden Newsletter, E-Mails und weitere elektronische Benachrichtigungen [...]
                </p>
                <p className="mb-4">
                    Löschung und Einschränkung der Verarbeitung: Wir können die ausgetragenen E-Mail-Adressen bis zu
                    drei Jahren [...]
                </p>
                <p className="mb-4">
                    <strong>Inhalte:</strong> Informationen zu uns, unseren Leistungen, Aktionen und Angeboten.
                </p>
                <ul className="list-disc ml-5 mb-4 space-y-2">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Bestandsdaten, Kontaktdaten [...]
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Kommunikationspartner
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Direktmarketing
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Einwilligung
                    </li>
                    <li>
                        <strong>Widerspruchsmöglichkeit (Opt-Out):</strong> Sie können den Empfang unseres Newsletters
                        [...]
                    </li>
                </ul>
                <p className="mb-2 font-semibold">Weitere Hinweise:</p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Messung von Öffnungs- und Klickraten:</strong> [...]
                    </li>
                </ul>

                {/* Webanalyse */}
                <h2 id="m263" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Webanalyse, Monitoring und Optimierung
                </h2>
                <p className="mb-4">
                    Die Webanalyse (auch als Reichweitenmessung bezeichnet) dient der Auswertung der Besucherströme
                    [...]
                </p>
                <p className="mb-4">
                    Neben der Webanalyse können wir auch Testverfahren einsetzen, um unterschiedliche Versionen [...]
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Nutzungsdaten, Meta-, Kommunikations- [...]
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Nutzer
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Einwilligung oder Berechtigte Interessen
                    </li>
                </ul>
                <p className="mb-2 font-semibold">Weitere Hinweise:</p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Google Analytics:</strong> [...]
                    </li>
                </ul>

                {/* Präsenzen in sozialen Netzwerken */}
                <h2 id="m136" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Präsenzen in sozialen Netzwerken (Social Media)
                </h2>
                <p className="mb-4">
                    Wir unterhalten Onlinepräsenzen innerhalb sozialer Netzwerke und verarbeiten in diesem Rahmen [...]
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Kontaktdaten, Inhaltsdaten [...]
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Nutzer
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO)
                    </li>
                </ul>
                <p className="mb-2 font-semibold">Weitere Hinweise:</p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Instagram:</strong> [...]
                    </li>
                    <li>
                        <strong>Facebook-Seiten:</strong> [...]
                    </li>
                </ul>

                {/* Plug-ins und eingebettete Funktionen */}
                <h2 id="m328" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Plug-ins und eingebettete Funktionen sowie Inhalte
                </h2>
                <p className="mb-4">
                    Wir binden Funktions- und Inhaltselemente in unser Onlineangebot ein, die von den Servern [...]
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Nutzungsdaten, Meta-, Kommunikations- [...]
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Nutzer
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Einwilligung oder Berechtigte Interessen
                    </li>
                </ul>
                <p className="mb-2 font-semibold">Weitere Hinweise:</p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Google Fonts (Bezug vom Google Server):</strong> [...]
                    </li>
                </ul>

                {/* Footer Seal */}
                <p className="text-sm text-gray-500 mt-8">
                    <a
                        href="https://datenschutz-generator.de/"
                        title="Rechtstext von Dr. Schwenke - für weitere Informationen bitte anklicken."
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="hover:underline"
                    >
                        Erstellt mit kostenlosem Datenschutz-Generator.de von Dr. Thomas Schwenke
                    </a>
                </p>
            </main>
        </>
    );
}
