import Head from "next/head";

export default function Datenschutz() {
    return (
        <>
            <Head>
                <title>Datenschutzerklärung | MainPlott</title>
                <meta name="description" content="Datenschutzerklärung von MainPlott" />
            </Head>

            <main className="max-w-screen-lg mx-auto px-4 py-8 font-body">
                <h1 className="text-2xl lg:text-4xl font-bold text-textColor mb-2">Datenschutzerklärung</h1>
                <p className="text-sm text-gray-600 mb-4">Stand: 15. Januar 2025</p>

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
                <h2 id="mOverview" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Übersicht der Verarbeitungen
                </h2>
                <p className="mb-2">
                    Die nachfolgende Übersicht fasst die Arten der verarbeiteten Daten und die Zwecke ihrer Verarbeitung
                    zusammen und verweist auf die betroffenen Personen.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-2">Arten der verarbeiteten Daten</h3>
                <ul className="list-disc ml-5 space-y-1 mb-4">
                    <li>Bestandsdaten</li>
                    <li>Zahlungsdaten</li>
                    <li>Kontaktdaten</li>
                    <li>Inhaltsdaten</li>
                    <li>Vertragsdaten</li>
                    <li>Nutzungsdaten</li>
                    <li>Meta-, Kommunikations- und Verfahrensdaten</li>
                    <li>Protokolldaten</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-2">Kategorien betroffener Personen</h3>
                <ul className="list-disc ml-5 space-y-1 mb-4">
                    <li>Leistungsempfänger und Auftraggeber</li>
                    <li>Interessenten</li>
                    <li>Kommunikationspartner</li>
                    <li>Nutzer</li>
                    <li>Geschäfts- und Vertragspartner</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-2">Zwecke der Verarbeitung</h3>
                <ul className="list-disc ml-5 space-y-1 mb-4">
                    <li>Erbringung vertraglicher Leistungen und Erfüllung vertraglicher Pflichten</li>
                    <li>Kommunikation</li>
                    <li>Sicherheitsmaßnahmen</li>
                    <li>Direktmarketing</li>
                    <li>Reichweitenmessung</li>
                    <li>Büro- und Organisationsverfahren</li>
                    <li>Feedback</li>
                    <li>Bereitstellung unseres Onlineangebotes</li>
                    <li>Öffentlichkeitsarbeit</li>
                </ul>

                <h2 id="m2427" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Maßgebliche Rechtsgrundlagen
                </h2>
                <p className="mb-4">
                    <strong>Maßgebliche Rechtsgrundlagen nach der DSGVO:</strong> Im Folgenden erhalten Sie eine
                    Übersicht der Rechtsgrundlagen der DSGVO, auf deren Basis wir personenbezogene Daten verarbeiten.
                    Bitte beachten Sie, dass neben den Regelungen der DSGVO nationale Datenschutzvorgaben in Ihrem Wohn-
                    oder Sitzland gelten können.
                </p>
                <ul className="list-disc ml-5 mb-4 space-y-1">
                    <li>
                        <strong>Einwilligung (Art. 6 Abs. 1 S. 1 lit. a) DSGVO):</strong> Die betroffene Person hat ihre
                        Einwilligung in die Verarbeitung der sie betreffenden personenbezogenen Daten für einen
                        spezifischen Zweck gegeben.
                    </li>
                    <li>
                        <strong>
                            Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1 S. 1 lit. b) DSGVO):
                        </strong>
                        Die Verarbeitung ist für die Erfüllung eines Vertrags erforderlich, dessen Vertragspartei die
                        betroffene Person ist.
                    </li>
                    <li>
                        <strong>Rechtliche Verpflichtung (Art. 6 Abs. 1 S. 1 lit. c) DSGVO):</strong> Die Verarbeitung
                        ist zur Erfüllung einer rechtlichen Verpflichtung erforderlich.
                    </li>
                    <li>
                        <strong>Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f) DSGVO):</strong> Die Verarbeitung ist
                        zur Wahrung der berechtigten Interessen des Verantwortlichen oder eines Dritten notwendig,
                        sofern die Interessen der betroffenen Person nicht überwiegen.
                    </li>
                </ul>
                <p className="mb-4">
                    <strong>Nationale Datenschutzregelungen in Deutschland:</strong> Zusätzlich zur DSGVO gelten
                    nationale Datenschutzvorschriften, insbesondere das Bundesdatenschutzgesetz (BDSG).
                </p>
                {/* Sicherheitsmaßnahmen */}
                <h2 id="m27" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Sicherheitsmaßnahmen
                </h2>
                <p className="mb-4">
                    Wir treffen nach Maßgabe der gesetzlichen Vorgaben geeignete technische und organisatorische
                    Maßnahmen, um ein dem Risiko angemessenes Schutzniveau zu gewährleisten. Dabei berücksichtigen wir
                    den Stand der Technik, die Implementierungskosten sowie Art, Umfang, Umstände und Zwecke der
                    Verarbeitung sowie die unterschiedlichen Eintrittswahrscheinlichkeiten und Schwere der Risiken für
                    die Rechte und Freiheiten natürlicher Personen.
                </p>
                <p className="mb-4">
                    Zu den Maßnahmen gehören insbesondere die Sicherung der Vertraulichkeit, Integrität und
                    Verfügbarkeit von Daten durch Kontrolle des physischen und elektronischen Zugangs zu den Daten sowie
                    des sie betreffenden Zugriffs, der Eingabe, Weitergabe, der Sicherung der Verfügbarkeit und ihrer
                    Trennung. Des Weiteren haben wir Verfahren eingerichtet, die eine Wahrnehmung von Rechten
                    betroffener Personen, die Löschung von Daten und Reaktionen auf die Gefährdung der Daten
                    gewährleisten. Ferner berücksichtigen wir den Schutz personenbezogener Daten bereits bei der
                    Entwicklung bzw. Auswahl von Hardware, Software sowie Verfahren entsprechend dem Prinzip des
                    Datenschutzes, durch Technikgestaltung und durch datenschutzfreundliche Voreinstellungen.
                </p>
                <p className="mb-4">
                    Sicherung von Online-Verbindungen durch TLS-/SSL-Verschlüsselungstechnologie (HTTPS), um die
                    Vertraulichkeit der über unsere Onlineangebote übermittelten Daten zu gewährleisten.
                </p>

                {/* Übermittlung von personenbezogenen Daten */}
                <h2 id="m25" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Übermittlung von personenbezogenen Daten
                </h2>
                <p className="mb-4">
                    Im Rahmen unserer Verarbeitung von personenbezogenen Daten kommt es vor, dass die Daten an andere
                    Stellen, Unternehmen, rechtlich selbstständige Organisationseinheiten oder Personen übermittelt oder
                    ihnen gegenüber offengelegt werden. Zu den Empfängern dieser Daten können z. B. mit IT-Aufgaben
                    beauftragte Dienstleister oder Anbieter von Software und Plattformen gehören.
                </p>
                <p className="mb-4">
                    In solchen Fällen beachten wir die gesetzlichen Vorgaben und schließen insbesondere entsprechende
                    Verträge bzw. Vereinbarungen mit den Empfängern Ihrer Daten ab, die der Sicherung Ihrer Daten
                    dienen.
                </p>

                {/* Internationale Datentransfers */}
                <h2 id="m24" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Internationale Datentransfers
                </h2>
                <p className="mb-4">
                    Sofern wir Daten in einem Drittland (d. h. außerhalb der Europäischen Union oder des Europäischen
                    Wirtschaftsraums) verarbeiten oder dies im Rahmen der Inanspruchnahme von Diensten Dritter oder
                    Offenlegung bzw. Übermittlung von Daten an andere Personen, Stellen oder Unternehmen geschieht,
                    erfolgt dies nur im Einklang mit den gesetzlichen Vorgaben.
                </p>
                <p className="mb-4">
                    Die Verarbeitung erfolgt auf Grundlage spezieller Garantien, wie der offiziell anerkannten
                    Feststellung eines der EU entsprechenden Datenschutzniveaus (z. B. für die USA durch den Privacy
                    Shield) oder der Beachtung offiziell anerkannter spezieller vertraglicher Verpflichtungen.
                </p>
                {/* Allgemeine Informationen zur Datenspeicherung und Löschung */}
                <h2 id="m12" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Allgemeine Informationen zur Datenspeicherung und Löschung
                </h2>
                <p className="mb-4">
                    Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Zwecke, für die sie
                    verarbeitet werden, erforderlich ist oder wir einer gesetzlichen Verpflichtung zur Aufbewahrung
                    unterliegen. Sobald die Daten nicht mehr benötigt werden oder rechtliche Aufbewahrungspflichten
                    ablaufen, werden sie routinemäßig gelöscht.
                </p>
                <p className="mb-4">
                    Wir orientieren uns bei der Speicherdauer an den gesetzlichen Vorgaben, insbesondere an den handels-
                    und steuerrechtlichen Vorschriften. In der Regel beträgt die gesetzliche Aufbewahrungsfrist 6 bis 10
                    Jahre. Daten, die nicht mehr benötigt werden, aber einer gesetzlichen Aufbewahrungsfrist
                    unterliegen, werden bis zum Ablauf dieser Frist gesperrt.
                </p>

                {/* Rechte der betroffenen Personen */}
                <h2 id="m10" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Rechte der betroffenen Personen
                </h2>
                <p className="mb-4">
                    Ihnen stehen als betroffene Person nach der DSGVO verschiedene Rechte zu, insbesondere das Recht auf
                    Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer personenbezogenen Daten.
                    Ferner können Sie jederzeit der Verarbeitung widersprechen, eine erteilte Einwilligung widerrufen
                    oder eine Datenübertragbarkeit verlangen.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Auskunftsrecht:</strong> Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob
                        Sie betreffende Daten verarbeitet werden. Ist dies der Fall, haben Sie ein Recht auf Auskunft
                        über diese Daten sowie auf weitere Informationen gemäß Art. 15 DSGVO.
                    </li>
                    <li>
                        <strong>Recht auf Berichtigung:</strong> Sie haben das Recht, die Berichtigung unrichtiger oder
                        die Vervollständigung unvollständiger Daten zu verlangen (Art. 16 DSGVO).
                    </li>
                    <li>
                        <strong>Recht auf Löschung:</strong> Unter bestimmten Voraussetzungen können Sie die Löschung
                        Ihrer Daten verlangen, insbesondere, wenn die Daten für die Zwecke, für die sie erhoben wurden,
                        nicht mehr benötigt werden oder Sie Ihre Einwilligung widerrufen haben (Art. 17 DSGVO).
                    </li>
                    <li>
                        <strong>Widerspruchsrecht:</strong> Sie haben das Recht, aus Gründen, die sich aus Ihrer
                        besonderen Situation ergeben, jederzeit gegen die Verarbeitung Ihrer Daten Widerspruch
                        einzulegen (Art. 21 DSGVO).
                    </li>
                </ul>
                <p className="mb-4">
                    Um Ihre Rechte auszuüben, können Sie uns jederzeit unter den in dieser Erklärung angegebenen
                    Kontaktdaten kontaktieren.
                </p>

                {/* Geschäftliche Leistungen */}
                <h2 id="m317" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Geschäftliche Leistungen
                </h2>
                <p className="mb-4">
                    Wir verarbeiten Daten unserer Vertrags- und Geschäftspartner, um unsere vertraglichen
                    Verpflichtungen zu erfüllen und unsere Dienstleistungen zu erbringen. Zu den verarbeiteten Daten
                    gehören insbesondere Kontaktdaten, Vertragsdaten sowie Zahlungsinformationen.
                </p>
                <p className="mb-4">
                    Die Verarbeitung erfolgt zur Durchführung vorvertraglicher Maßnahmen, zur Erbringung vertraglicher
                    Leistungen und zur Kundenbetreuung. Die Speicherung erfolgt für die Dauer der Vertragsbeziehung und
                    im Rahmen gesetzlicher Aufbewahrungsfristen.
                </p>
                <ul className="list-disc ml-5 mb-4 space-y-2">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Bestandsdaten (z. B. Namen, Adressen), Zahlungsdaten,
                        Kontaktdaten, Vertragsdaten (z. B. in Anspruch genommene Leistungen).
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Kunden, Geschäftspartner, Interessenten.
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Erfüllung vertraglicher Verpflichtungen,
                        Kundenbetreuung, Abwicklung von Zahlungen.
                    </li>
                </ul>
                {/* Bereitstellung des Onlineangebots und Webhosting */}
                <h2 id="m225" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Bereitstellung des Onlineangebots und Webhosting
                </h2>
                <p className="mb-4">
                    Wir verarbeiten die Daten der Nutzer, um ihnen unsere Online-Dienste zur Verfügung stellen zu
                    können. Dazu zählen insbesondere die Darstellung von Inhalten und Funktionen, die technische
                    Bereitstellung sowie Sicherheitsmaßnahmen.
                </p>
                <ul className="list-disc ml-5 mb-4 space-y-2">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Nutzungsdaten (z. B. besuchte Webseiten,
                        Zugriffszeiten), Meta- und Kommunikationsdaten (z. B. IP-Adressen).
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Nutzer unseres Onlineangebots.
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Bereitstellung des Onlineangebots, Verbesserung der
                        Nutzererfahrung, Sicherheitsmaßnahmen.
                    </li>
                </ul>
                <p className="mb-4">
                    Die Datenverarbeitung erfolgt auf der Grundlage berechtigter Interessen gemäß Art. 6 Abs. 1 lit. f
                    DSGVO, um eine technisch einwandfreie und sichere Bereitstellung unseres Onlineangebots zu
                    gewährleisten.
                </p>

                {/* Einsatz von Cookies */}
                <h2 id="m134" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Einsatz von Cookies
                </h2>
                <p className="mb-4">
                    Unsere Website verwendet Cookies und ähnliche Technologien, um die Benutzerfreundlichkeit zu
                    verbessern und bestimmte Funktionen bereitzustellen. Cookies sind kleine Textdateien, die auf dem
                    Endgerät des Nutzers gespeichert werden.
                </p>
                <p className="mb-4">
                    <strong>Arten von Cookies:</strong>
                </p>
                <ul className="list-disc ml-5 space-y-1 mb-4">
                    <li>
                        <strong>Essentielle Cookies:</strong> Diese Cookies sind notwendig, um grundlegende Funktionen
                        der Website sicherzustellen, z. B. die Navigation oder den Zugriff auf geschützte Bereiche.
                    </li>
                    <li>
                        <strong>Funktionale Cookies:</strong> Diese Cookies ermöglichen es, erweiterte Funktionen und
                        Personalisierung anzubieten, z. B. das Speichern von Spracheinstellungen.
                    </li>
                    <li>
                        <strong>Performance- und Analyse-Cookies:</strong> Diese Cookies sammeln Informationen darüber,
                        wie Besucher unsere Website nutzen, z. B. welche Seiten am häufigsten besucht werden. Diese
                        Informationen helfen uns, die Leistung der Website zu verbessern.
                    </li>
                </ul>
                <p className="mb-4">
                    <strong>Widerruf und Widerspruch:</strong> Sie können der Nutzung von Cookies jederzeit
                    widersprechen oder Ihre Einwilligung widerrufen. Nutzen Sie dazu die entsprechenden Einstellungen in
                    Ihrem Browser oder unser Cookie-Management-Tool auf der Website.
                </p>
                <p className="mb-4">
                    Weitere Informationen zum Einsatz von Cookies finden Sie in unseren Cookie-Richtlinien.
                </p>
                {/* Kontakt- und Anfrageverwaltung */}
                <h2 id="m182" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Kontakt- und Anfrageverwaltung
                </h2>
                <p className="mb-4">
                    Bei der Kontaktaufnahme mit uns (z. B. per Post, Kontaktformular, E-Mail, Telefon oder über soziale
                    Medien) werden die angegebenen Daten der anfragenden Personen verarbeitet, soweit dies zur
                    Beantwortung der Kontaktanfragen und etwaiger angefragter Maßnahmen erforderlich ist.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Bestandsdaten (z. B. Namen, Adressen), Kontaktdaten
                        (z. B. E-Mail, Telefonnummern), Inhaltsdaten (z. B. Texteingaben, hochgeladene Dateien).
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Kommunikationspartner.
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Kommunikation, Beantwortung von Anfragen, Verbesserung
                        von Kundenservices.
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1
                        lit. b DSGVO), berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO).
                    </li>
                </ul>
                <p className="mb-4">
                    Die Daten können in einem Customer-Relationship-Management-System (CRM-System) oder einem
                    vergleichbaren System zur Anfrageorganisation gespeichert werden.
                </p>

                {/* Newsletter */}
                <h2 id="m17" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Newsletter und elektronische Benachrichtigungen
                </h2>
                <p className="mb-4">
                    Wir versenden Newsletter, E-Mails und weitere elektronische Benachrichtigungen mit werblichen
                    Informationen (nachfolgend Newsletter) nur mit der Einwilligung der Empfänger oder einer
                    gesetzlichen Erlaubnis. Unsere Newsletter enthalten Informationen zu uns, unseren Leistungen,
                    Aktionen und Angeboten.
                </p>
                <p className="mb-4">
                    <strong>Anmeldung und Protokollierung:</strong> Die Anmeldung zu unserem Newsletter erfolgt in einem
                    sogenannten Double-Opt-In-Verfahren. Nach der Anmeldung erhalten Sie eine E-Mail, in der Sie um die
                    Bestätigung Ihrer Anmeldung gebeten werden. Diese Bestätigung ist notwendig, um zu verhindern, dass
                    sich jemand mit fremden E-Mail-Adressen anmelden kann.
                </p>
                <p className="mb-4">
                    <strong>Analyse und Erfolgsmessung:</strong> Unsere Newsletter enthalten eine sogenannte
                    web-beacon-Datei, die beim Öffnen des Newsletters von unserem Server abgerufen wird. Im Rahmen
                    dieses Abrufs werden technische Informationen, wie Informationen zum Browser und Ihrem System, sowie
                    Ihre IP-Adresse und der Zeitpunkt des Abrufs erhoben.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Bestandsdaten (z. B. E-Mail-Adressen), Nutzungsdaten
                        (z. B. Öffnungs- und Klickraten).
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Abonnenten des Newsletters.
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Direktmarketing, Erfolgsmessung, Optimierung von
                        Kampagnen.
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
                    </li>
                </ul>
                <p className="mb-4">
                    <strong>Widerrufsmöglichkeit:</strong> Sie können den Empfang unseres Newsletters jederzeit
                    kündigen, d. h. Ihre Einwilligungen widerrufen. Einen Link zur Abmeldung finden Sie am Ende eines
                    jeden Newsletters.
                </p>
                {/* Webanalyse */}
                <h2 id="m263" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Webanalyse, Monitoring und Optimierung
                </h2>
                <p className="mb-4">
                    Die Webanalyse (auch als Reichweitenmessung bezeichnet) dient der Auswertung der Besucherströme
                    unseres Onlineangebotes und kann Verhalten, Interessen oder demografische Informationen der Nutzer
                    als pseudonyme Werte umfassen. Mit Hilfe der Reichweitenanalyse können wir z. B. erkennen, zu
                    welcher Zeit unser Onlineangebot oder dessen Funktionen oder Inhalte am häufigsten genutzt werden
                    oder zur Wiederverwendung einladen.
                </p>
                <p className="mb-4">
                    Zu diesen Zwecken können pseudonyme Profile der Nutzer erstellt werden, die Daten können in einem
                    Cookie gespeichert oder ähnliche Verfahren genutzt werden, um die relevanten Nutzerdaten zu
                    speichern. Zu den gespeicherten Daten können insbesondere betrachtete Inhalte, besuchte Webseiten,
                    genutzte Systeme und technische Angaben wie der verwendete Browser oder das Betriebssystem gehören.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Nutzungsdaten (z. B. besuchte Webseiten,
                        Zugriffszeiten), Meta-, Kommunikations- und Verfahrensdaten (z. B. IP-Adresse, Browser).
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Nutzer unseres Onlineangebotes.
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Reichweitenmessung, Marketing, Optimierung von
                        Inhalten und Funktionen.
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), berechtigte
                        Interessen (Art. 6 Abs. 1 lit. f DSGVO).
                    </li>
                </ul>
                <p className="mb-4">
                    Sie können der Verarbeitung Ihrer Daten zu Analysezwecken widersprechen oder eine erteilte
                    Einwilligung widerrufen, indem Sie entsprechende Einstellungen in Ihrem Browser vornehmen oder über
                    die Datenschutzeinstellungen unseres Onlineangebotes.
                </p>

                {/* Präsenzen in sozialen Netzwerken */}
                <h2 id="m136" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Präsenzen in sozialen Netzwerken (Social Media)
                </h2>
                <p className="mb-4">
                    Wir unterhalten Onlinepräsenzen innerhalb sozialer Netzwerke, um mit den dort aktiven Nutzern zu
                    kommunizieren oder um Informationen über uns anzubieten. Wir weisen darauf hin, dass dabei Daten der
                    Nutzer außerhalb des Raumes der Europäischen Union verarbeitet werden können. Hierdurch können sich
                    für die Nutzer Risiken ergeben, da so z. B. die Durchsetzung der Rechte der Nutzer erschwert werden
                    könnte.
                </p>
                <p className="mb-4">
                    Ferner werden die Daten der Nutzer in der Regel für Marktforschungs- und Werbezwecke verarbeitet. So
                    können z. B. aus dem Nutzungsverhalten und sich daraus ergebenden Interessen der Nutzer
                    Nutzungsprofile erstellt werden. Diese Nutzungsprofile können wiederum verwendet werden, um z. B.
                    Werbeanzeigen innerhalb und außerhalb der Netzwerke zu schalten, die mutmaßlich den Interessen der
                    Nutzer entsprechen.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Bestandsdaten (z. B. Namen, Adressen), Inhaltsdaten
                        (z. B. Texteingaben), Nutzungsdaten (z. B. besuchte Webseiten, Zugriffszeiten), Meta-,
                        Kommunikations- und Verfahrensdaten (z. B. IP-Adressen).
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Nutzer der sozialen Netzwerke.
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Kommunikation, Marketing, Marktforschung.
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO).
                    </li>
                </ul>
                <p className="mb-4">
                    Für detaillierte Informationen und Möglichkeiten des Opt-Outs verweisen wir auf die
                    Datenschutzhinweise und Angaben der Betreiber der jeweiligen Netzwerke.
                </p>
                {/* Plug-ins und eingebettete Inhalte */}
                <h2 id="m328" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Plug-ins und eingebettete Funktionen sowie Inhalte
                </h2>
                <p className="mb-4">
                    Wir binden in unser Onlineangebot Funktions- und Inhaltselemente ein, die von den Servern ihrer
                    jeweiligen Anbieter (nachfolgend bezeichnet als „Drittanbieter“) bezogen werden. Dabei kann es sich
                    zum Beispiel um Grafiken, Videos oder Social-Media-Buttons sowie Beiträge handeln (nachfolgend
                    einheitlich bezeichnet als „Inhalte“).
                </p>
                <p className="mb-4">
                    Die Einbindung setzt immer voraus, dass die Drittanbieter dieser Inhalte die IP-Adresse der Nutzer
                    verarbeiten, da sie ohne die IP-Adresse die Inhalte nicht an deren Browser senden könnten. Die
                    IP-Adresse ist damit für die Darstellung dieser Inhalte oder Funktionen erforderlich. Drittanbieter
                    können ferner sogenannte Pixel-Tags (unsichtbare Grafiken, auch als „Web Beacons“ bezeichnet) für
                    statistische oder Marketingzwecke verwenden. Durch die „Pixel-Tags“ können Informationen, wie der
                    Besucherverkehr auf den Seiten dieser Website, ausgewertet werden.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Nutzungsdaten (z. B. besuchte Webseiten,
                        Zugriffszeiten), Meta-, Kommunikations- und Verfahrensdaten (z. B. IP-Adressen).
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Nutzer unseres Onlineangebotes.
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Bereitstellung unseres Onlineangebotes und
                        Nutzerfreundlichkeit, Optimierung und Sicherheit.
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), berechtigte
                        Interessen (Art. 6 Abs. 1 lit. f DSGVO).
                    </li>
                </ul>
                <p className="mb-4">
                    Für detaillierte Informationen zur Verarbeitung Ihrer Daten und zur Widerspruchsmöglichkeit
                    verweisen wir auf die Datenschutzhinweise der jeweiligen Drittanbieter.
                </p>

                {/* Cookies */}
                <h2 id="m134" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Einsatz von Cookies
                </h2>
                <p className="mb-4">
                    Unser Onlineangebot verwendet „Cookies“ – kleine Textdateien, die auf Geräten der Nutzer gespeichert
                    werden. Cookies dienen verschiedenen Zwecken: Sie können zur Speicherung von Einstellungen genutzt
                    werden, für statistische Auswertungen oder zur Funktionalität unseres Onlineangebots.
                </p>
                <p className="mb-4">
                    Wir setzen sowohl temporäre Cookies (Session-Cookies) ein, die nach dem Besuch der Website gelöscht
                    werden, als auch permanente Cookies, die für einen bestimmten Zeitraum auf Ihrem Gerät gespeichert
                    bleiben. Nutzer können die Speicherung von Cookies in den Einstellungen ihres Browsers
                    kontrollieren, einschränken oder deaktivieren. Eine vollständige Deaktivierung von Cookies kann
                    jedoch dazu führen, dass einige Funktionen unseres Onlineangebotes nicht mehr wie vorgesehen
                    funktionieren.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Nutzungsdaten (z. B. besuchte Webseiten,
                        Zugriffszeiten), Meta-, Kommunikations- und Verfahrensdaten (z. B. IP-Adressen).
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Nutzer unseres Onlineangebotes.
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Bereitstellung des Onlineangebotes, Optimierung der
                        Inhalte, Reichweitenmessung.
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), berechtigte
                        Interessen (Art. 6 Abs. 1 lit. f DSGVO).
                    </li>
                </ul>
                <p className="mb-4">
                    Nutzer können jederzeit in den Einstellungen unseres Onlineangebotes festlegen, ob sie Cookies
                    akzeptieren oder ablehnen möchten. Alternativ können Cookies auch über die Einstellungen im Browser
                    gelöscht oder blockiert werden.
                </p>
                {/* Kontakt- und Anfrageverwaltung */}
                <h2 id="m182" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Kontakt- und Anfrageverwaltung
                </h2>
                <p className="mb-4">
                    Wenn Sie mit uns Kontakt aufnehmen (z. B. per Kontaktformular, E-Mail, Telefon oder via soziale
                    Medien), verarbeiten wir Ihre Angaben zur Bearbeitung der Kontaktanfrage sowie deren Abwicklung. Die
                    Angaben der Nutzer können in einem Customer-Relationship-Management-System („CRM-System“) oder einer
                    vergleichbaren Anfragenorganisation gespeichert werden.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Bestandsdaten (z. B. Namen, Adressen), Kontaktdaten
                        (z. B. E-Mail-Adressen, Telefonnummern), Inhaltsdaten (z. B. Texteingaben, Fotografien),
                        Nutzungsdaten (z. B. Zugriffszeiten).
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Kommunikationspartner.
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Beantwortung von Kontaktanfragen, Kommunikation,
                        Pflege von Geschäftsbeziehungen.
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1
                        lit. b DSGVO), berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO).
                    </li>
                </ul>
                <p className="mb-4">
                    Wir löschen die Anfragen, sofern diese nicht mehr erforderlich sind. Wir überprüfen die
                    Erforderlichkeit regelmäßig. Darüber hinaus gelten die gesetzlichen Archivierungspflichten.
                </p>

                {/* Newsletter und elektronische Benachrichtigungen */}
                <h2 id="m17" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Newsletter und elektronische Benachrichtigungen
                </h2>
                <p className="mb-4">
                    Wir versenden Newsletter, E-Mails und andere elektronische Benachrichtigungen (nachfolgend
                    „Newsletter“) nur mit der Einwilligung der Empfänger oder einer gesetzlichen Erlaubnis.
                </p>
                <p className="mb-4">
                    Die Anmeldung zu unserem Newsletter erfolgt in einem sogenannten Double-Opt-In-Verfahren. Das
                    bedeutet, dass Sie nach der Anmeldung eine E-Mail erhalten, in der Sie um die Bestätigung Ihrer
                    Anmeldung gebeten werden. Diese Bestätigung ist notwendig, um zu verhindern, dass sich jemand mit
                    fremden E-Mail-Adressen anmelden kann. Die Anmeldungen zum Newsletter werden protokolliert, um den
                    Anmeldeprozess entsprechend den rechtlichen Anforderungen nachweisen zu können.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Bestandsdaten (z. B. Namen), Kontaktdaten (z. B.
                        E-Mail-Adresse).
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Newsletter-Empfänger.
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Bereitstellung von Informationen zu unseren
                        Dienstleistungen und Angeboten, Marketing.
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), berechtigte
                        Interessen (Art. 6 Abs. 1 lit. f DSGVO).
                    </li>
                </ul>
                <p className="mb-4">
                    Sie können den Empfang unseres Newsletters jederzeit kündigen, d. h., Ihre Einwilligungen
                    widerrufen. Einen Link zur Kündigung des Newsletters finden Sie am Ende eines jeden Newsletters. Wir
                    können die ausgetragenen E-Mail-Adressen bis zu drei Jahre auf Grundlage unserer berechtigten
                    Interessen speichern, bevor wir sie löschen, um eine zuvor gegebene Einwilligung nachweisen zu
                    können.
                </p>

                {/* Webanalyse, Monitoring und Optimierung */}
                <h2 id="m263" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Webanalyse, Monitoring und Optimierung
                </h2>
                <p className="mb-4">
                    Die Webanalyse dient der Auswertung der Besucherströme unseres Onlineangebotes und kann Verhalten,
                    Interessen oder demografische Informationen der Nutzer wie Alter oder Geschlecht als pseudonyme
                    Werte umfassen. Mit Hilfe der Webanalyse können wir z. B. erkennen, zu welchem Zeitpunkt unser
                    Onlineangebot oder dessen Funktionen oder Inhalte am häufigsten genutzt werden oder zur
                    Wiederverwendung einladen.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Nutzungsdaten (z. B. besuchte Webseiten, Interesse an
                        Inhalten, Zugriffszeiten), Meta-, Kommunikations- und Verfahrensdaten (z. B. IP-Adressen,
                        Browser-Typen, Betriebssysteme, Referrer-URLs).
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Nutzer des Onlineangebotes.
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Reichweitenmessung, Erfolgsmessung von
                        Marketingmaßnahmen, Optimierung des Onlineangebotes.
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), berechtigte
                        Interessen (Art. 6 Abs. 1 lit. f DSGVO).
                    </li>
                </ul>
                <p className="mb-4">
                    Die Analyse erfolgt anonymisiert oder pseudonymisiert, sofern keine ausdrückliche Einwilligung der
                    Nutzer vorliegt. Die pseudonymisierten Profile werden nicht mit personenbezogenen Daten
                    zusammengeführt.
                </p>

                {/* Präsenzen in sozialen Netzwerken */}
                <h2 id="m136" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Präsenzen in sozialen Netzwerken (Social Media)
                </h2>
                <p className="mb-4">
                    Wir unterhalten Onlinepräsenzen innerhalb sozialer Netzwerke, um mit den dort aktiven Nutzern zu
                    kommunizieren oder um Informationen über uns anzubieten. Dabei können Daten der Nutzer außerhalb der
                    Europäischen Union verarbeitet werden. Dies kann Risiken für die Nutzer mit sich bringen, da so z.
                    B. die Durchsetzung der Rechte der Nutzer erschwert werden könnte.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Kontaktdaten (z. B. E-Mail-Adressen, Telefonnummern),
                        Inhaltsdaten (z. B. Texteingaben, Fotografien, Videos), Nutzungsdaten (z. B. Interesse an
                        Inhalten, Zugriffszeiten).
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Nutzer sozialer Netzwerke.
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Kommunikation mit den Nutzern, Bereitstellung von
                        Informationen.
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO).
                    </li>
                </ul>
                <p className="mb-4">
                    Weitere Informationen zu der Verarbeitung der Daten und zu den Widerspruchsmöglichkeiten (Opt-Out)
                    finden Sie in den Datenschutzhinweisen der jeweiligen Anbieter.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Instagram:</strong>{" "}
                        <a
                            href="https://help.instagram.com/519522125107875"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primaryColor hover:underline"
                        >
                            Datenschutzerklärung
                        </a>
                    </li>
                    <li>
                        <strong>Facebook:</strong>{" "}
                        <a
                            href="https://www.facebook.com/about/privacy/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primaryColor hover:underline"
                        >
                            Datenschutzerklärung
                        </a>
                    </li>
                </ul>
                {/* Plug-ins und eingebettete Funktionen sowie Inhalte */}
                <h2 id="m328" className="text-xl lg:text-2xl font-semibold mt-8 mb-4">
                    Plug-ins und eingebettete Funktionen sowie Inhalte
                </h2>
                <p className="mb-4">
                    Wir binden in unser Onlineangebot Funktions- und Inhaltselemente ein, die von den Servern ihrer
                    jeweiligen Anbieter bezogen werden (nachfolgend bezeichnet als „Drittanbieter“). Dies können z. B.
                    Grafiken, Videos oder soziale Medien-Schaltflächen sowie Beiträge (nachfolgend einheitlich
                    bezeichnet als „Inhalte“) sein.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Verarbeitete Datenarten:</strong> Nutzungsdaten (z. B. besuchte Webseiten, Interesse an
                        Inhalten, Zugriffszeiten), Meta-, Kommunikations- und Verfahrensdaten (z. B. IP-Adressen).
                    </li>
                    <li>
                        <strong>Betroffene Personen:</strong> Nutzer des Onlineangebotes.
                    </li>
                    <li>
                        <strong>Zwecke der Verarbeitung:</strong> Bereitstellung unseres Onlineangebotes und
                        Nutzerfreundlichkeit, Integration von Inhalten.
                    </li>
                    <li>
                        <strong>Rechtsgrundlagen:</strong> Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), berechtigte
                        Interessen (Art. 6 Abs. 1 lit. f DSGVO).
                    </li>
                </ul>
                <p className="mb-4">
                    Die Einbindung setzt immer voraus, dass die Drittanbieter dieser Inhalte die IP-Adresse der Nutzer
                    verarbeiten, da sie ohne die IP-Adresse die Inhalte nicht an deren Browser senden könnten. Die
                    IP-Adresse ist damit für die Darstellung dieser Inhalte erforderlich. Drittanbieter können ferner
                    sogenannte Pixel-Tags (unsichtbare Grafiken, auch „Web Beacons“ genannt) für statistische oder
                    Marketingzwecke verwenden. Die „Pixel-Tags“ können Informationen wie den Besucherverkehr auf den
                    Seiten dieser Website auswerten.
                </p>
                <p className="mb-4">
                    Weitere Hinweise zur Verarbeitung Ihrer Daten und zu den Widerspruchsmöglichkeiten (Opt-Out) finden
                    Sie in den Datenschutzhinweisen der jeweiligen Anbieter.
                </p>
                <ul className="list-disc ml-5 space-y-2 mb-4">
                    <li>
                        <strong>Google Fonts:</strong>{" "}
                        <a
                            href="https://fonts.google.com/about"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primaryColor hover:underline"
                        >
                            Datenschutzerklärung
                        </a>
                    </li>
                    <li>
                        <strong>YouTube:</strong>{" "}
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primaryColor hover:underline"
                        >
                            Datenschutzerklärung
                        </a>
                    </li>
                    <li>
                        <strong>Instagram:</strong>{" "}
                        <a
                            href="https://help.instagram.com/519522125107875"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primaryColor hover:underline"
                        >
                            Datenschutzerklärung
                        </a>
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
