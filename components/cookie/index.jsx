import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Cookies from "js-cookie"; // optional: to manage cookies easily
import Link from "next/link";

/**
 * CookieConsentBanner
 *
 * - Blocks the site content via an overlay until user accepts or declines.
 * - Stores consent choice in a cookie (cookieConsent = 'accepted' or 'declined').
 * - If user hasn't made a choice, the banner is shown.
 */
export default function CookieConsentBanner() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user already made a choice
        const consent = Cookies.get("cookieConsent");
        if (!consent) {
            // No choice made => show the banner
            setIsOpen(true);
        }
    }, []);

    const handleAccept = () => {
        // Mark cookies as accepted
        Cookies.set("cookieConsent", "accepted", { expires: 365 }); // valid 1 year
        setIsOpen(false);
        // If needed, load your analytics scripts here, or set a global state
    };

    const handleDecline = () => {
        // Mark cookies as declined
        Cookies.set("cookieConsent", "declined", { expires: 365 });
        setIsOpen(false);
        // Do NOT load analytics scripts
    };

    if (!isOpen) return null; // nothing to show if user already made a choice

    // The overlay that blocks entire site
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex font-body items-center justify-center bg-black bg-opacity-70">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 m-4 text-center space-y-4">
                <h2 className="text-xl font-semibold">Cookie-Einstellungen</h2>
                <p className="text-gray-700">
                    Wir verwenden Cookies, um unsere Website und unseren Service zu optimieren. Bitte wähle aus, ob du
                    alle Cookies zulassen möchtest oder nur essenzielle.
                </p>

                <div className="flex flex-col md:flex-row md:justify-center gap-4 mt-6">
                    <button
                        onClick={handleAccept}
                        className="bg-primaryColor text-white px-6 py-2 rounded hover:bg-primaryColor-600 transition"
                    >
                        Alle Cookies akzeptieren
                    </button>
                    <button
                        onClick={handleDecline}
                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition"
                    >
                        Nur notwendige Cookies
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Du kannst deine Einstellungen jederzeit in unserer{" "}
                    <Link href="/datenschutz" className="underline text-primaryColor hover:text-primaryColor-600">
                        Datenschutzerklärung
                    </Link>{" "}
                    ändern.
                </p>
            </div>
        </div>,
        document.body
    );
}
