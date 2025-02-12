import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
} from "firebase/auth";
import { auth, saveUserDataToFirestore, getUserData, firestore } from "@/config/firebase"; // Import utility function
import axios from "axios";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Import Zustand store
import useUserStore from "@/store/userStore";

// Example typography components from your project
import { H3 } from "@/components/typography";

export default function Signup() {
    const router = useRouter();

    // Zustand store
    const setUser = useUserStore((state) => state.setUser);

    // Toggle between Login or Signup
    const [mode, setMode] = useState("signup"); // "signup" or "login"
    // Also toggles between "privatkunde" or "firmenkunde" during signup
    const [userType, setUserType] = useState("firmenkunde");

    // Common states
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Login form fields
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Signup fields for Privatkunde
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Signup fields for Firmenkunde
    const [companyEmail, setCompanyEmail] = useState("");
    const [passwordFirma, setPasswordFirma] = useState("");
    const [businessNumber, setBusinessNumber] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [companyAdress, setCompanyAdress] = useState("");
    const [companyCity, setCompanyCity] = useState("");

    console.log(process.env.NEXT_PUBLIC_DEV, process.env.NEXT_DEV === "true");

    useEffect(() => {
        if (router.query.mode === "login") {
            setMode("login");
        }
    }, [router.query.mode]);

    //---------------------------------------------------
    // 1. SIGNUP HANDLER (Privatkunde / Firmenkunde)
    //---------------------------------------------------
    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            let userData = {};
            let firebaseUser;
            let collectionName = ""; // Initialize collection name

            if (userType === "privatkunde") {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                firebaseUser = userCredential.user;
                userData = { email, userType: "privatkunde" };

                // Determine collection name
                collectionName = "privatUsers";
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, companyEmail, passwordFirma);
                firebaseUser = userCredential.user;
                userData = {
                    email: companyEmail,
                    companyName,
                    businessNumber,
                    companyAdress,
                    companyCity,
                    userType: "firmenkunde",
                };

                console.log(process.env.NEXT_PUBLIC_DEV, process.env.NEXT_PUBLIC_DEV === "true");
                // Determine collection name
                collectionName = "firmenUsers";
            }

            await saveUserDataToFirestore(
                firebaseUser.uid,
                userData,
                process.env.NEXT_PUBLIC_DEV === "true" ? `dev_${collectionName}` : collectionName
            );

            // 1A) Optionally sync user with Shopify
            await fetch("/api/shopifyCreateCustomer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            // 1B) Optionally send a custom email after signup
            await axios.post("/api/sendSubscriptionEmail", userData);

            // 1C) Update global Zustand state with user info
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                userType: userData.userType,
            });

            // 1D) Redirect to homepage with a welcome message
            router.push("/?welcome=1");
        } catch (err) {
            console.error("Signup Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    //---------------------------------------------------
    // 2. LOGIN HANDLER (Existing Users)
    //---------------------------------------------------

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            const firebaseUser = userCredential.user;

            // User-Daten aus Firestore holen
            const userData = await getUserData(firebaseUser.uid, process.env.NEXT_PUBLIC_DEV === "true");

            if (!userData) {
                throw new Error("Benutzer nicht gefunden.");
            }

            // Zustand mit User-Daten aktualisieren
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                userType: userData.userType, // "privatkunde" oder "firmenkunde"
                ...userData,
            });

            router.push("/?loggedIn=1");
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    //---------------------------------------------------
    // 3. SOCIAL LOGINS (Google, Facebook)
    //---------------------------------------------------
    const handleGoogleSignup = async () => {
        setError("");
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);

            const firebaseUser = userCredential.user;
            // If you want to sync with Shopify, do it here
            // For now, let's just store user info in Zustand:
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                userType: "privatkunde", // or fetch from somewhere
            });

            router.push("/?loggedIn=1");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookSignup = async () => {
        setError("");
        setLoading(true);
        try {
            const provider = new FacebookAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);

            const firebaseUser = userCredential.user;
            // If you want to sync with Shopify, do it here
            // For now, let's just store user info in Zustand:
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                userType: "privatkunde", // or fetch from somewhere
            });

            router.push("/?loggedIn=1");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 flex lg:mt-12 justify-center px-4 font-body">
            {/* Container */}
            <div className="max-w-md w-full bg-white rounded-md shadow-md p-6">
                <H3 klasse="text-center mb-4">Anmeldung</H3>

                {/* Toggle between "Login" or "Signup" */}
                <div className="flex justify-center mb-6">
                    <button
                        type="button"
                        onClick={() => setMode("login")}
                        className={`px-4 py-2 rounded-l-md border border-gray-300
              ${mode === "login" ? "bg-primaryColor text-white" : "bg-white text-gray-700"}`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className={`px-4 py-2 rounded-r-md border border-gray-300
              ${mode === "signup" ? "bg-primaryColor text-white" : "bg-white text-gray-700"}`}
                    >
                        Signup
                    </button>
                </div>

                {/* LOGIN FORM */}
                {mode === "login" && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="Deine Email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
                            <input
                                type="password"
                                placeholder="Passwort"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primaryColor text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {loading ? "Loading..." : "Einloggen"}
                        </button>
                    </form>
                )}

                {/* SIGNUP FORM */}
                {mode === "signup" && (
                    <>
                        {/* Toggle Privatkunde / Firmenkunde */}
                        {/* <div className="flex justify-center mb-6 mt-6">
                            <button
                                type="button"
                                onClick={() => setUserType("privatkunde")}
                                className={`px-4 py-2 rounded-l-md border border-gray-300
                  ${userType === "privatkunde" ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
                            >
                                Privatkunde
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserType("firmenkunde")}
                                className={`px-4 py-2 rounded-r-md border border-gray-300
                  ${userType === "firmenkunde" ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
                            >
                                Firmenkunde
                            </button>
                        </div> */}

                        {/* PRIVATKUNDE FORM */}
                        {userType === "privatkunde" && (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
                                    <input
                                        type="password"
                                        placeholder="Passwort"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primaryColor text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {loading ? "Loading..." : "Anmelden"}
                                </button>

                                <div className="text-center text-sm text-gray-500 my-2">oder</div>

                                {/* Google Sign Up Button */}
                                <button
                                    type="button"
                                    onClick={handleGoogleSignup}
                                    className="flex items-center justify-center w-full border border-gray-300 rounded-md py-2 hover:bg-gray-100"
                                >
                                    {/* Inline Google Icon (SVG) */}
                                    <svg
                                        viewBox="0 0 533.5 544.3"
                                        className="w-5 h-5 mr-2"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fill="#4285f4"
                                            d="M533.5 278.4c0-15.4-1.2-30.2-3.5-44.5H272v84.1h146.7c-6.3 34.1-25.3 62.9-53.8 82.2v68h87.2c51 46.9 80.4 116.3 80.4 194.7z"
                                        />
                                        <path
                                            fill="#34a853"
                                            d="M272 544.3c72.9 0 134.1-24.2 178.8-65.6l-87.2-68c-24 16.1-55 25.6-91.6 25.6-69.9 0-129-47.2-150.3-110.7H32.5v69.5C76.6 498 169.7 544.3 272 544.3z"
                                        />
                                        <path
                                            fill="#fbbc04"
                                            d="M121.7 325.6c-10.5-31.4-10.5-65.4 0-96.9V159.3H32.5A272 272 0 0 0 0 272c0 42.2 10 82 32.5 112.7l89.2-69.1z"
                                        />
                                        <path
                                            fill="#ea4335"
                                            d="M272 108.5c37.2 0 70.6 12.8 97 38l72.8-72.8C403.5 28.4 343.1 0 272 0 169.7 0 76.6 46.3 32.5 159.3l89.2 69.4C143 165.7 202.1 108.5 272 108.5z"
                                        />
                                    </svg>
                                    <span>Mit Google anmelden</span>
                                </button>
                            </form>
                        )}

                        {/* FIRMENKUNDE FORM */}
                        {/* FIRMENKUNDE FORM */}
                        {userType === "firmenkunde" && (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        placeholder="Geschäfts-E-Mail"
                                        value={companyEmail}
                                        onChange={(e) => setCompanyEmail(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
                                    <input
                                        type="password"
                                        placeholder="Passwort"
                                        value={passwordFirma}
                                        onChange={(e) => setPasswordFirma(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
                                    <input
                                        type="text"
                                        placeholder="Firmenname (z. B. GmbH, AG)"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Umsatzsteuer-ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="DE123456789"
                                        value={businessNumber}
                                        onChange={(e) => setBusinessNumber(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Geschäftsanschrift
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Straße und Hausnummer"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                        onChange={(e) => setCompanyAdress(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="PLZ und Ort"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => setCompanyCity(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primaryColor text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {loading ? "Loading..." : "Als Firmenkunde anmelden"}
                                </button>
                            </form>
                        )}
                    </>
                )}

                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </div>
        </div>
    );
}
