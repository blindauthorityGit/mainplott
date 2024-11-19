import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/config/firebase"; // Importiere auth aus deiner firebase.js

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();

    // Email/Passwort Login
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard"); // Weiterleitung nach Login
        } catch (err) {
            setError(err.message);
        }
    };

    // Google Login
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push("/dashboard"); // Weiterleitung nach Login
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="E-Mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="Passwort"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
                        Anmelden
                    </button>
                </form>
                <p className="text-center my-4 text-gray-500">Oder</p>
                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 flex items-center justify-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.539 10H12v4.5h6.756C17.888 17.298 15.182 19 12 19c-3.866 0-7-3.134-7-7s3.134-7 7-7c1.692 0 3.243.598 4.468 1.586l3.313-3.313C17.302 1.885 14.761 1 12 1 5.925 1 1 5.925 1 12s4.925 11 11 11c5.954 0 10.914-4.545 11.92-10.5.053-.3.08-.61.08-.91 0-.56-.05-1.1-.131-1.59z" />
                    </svg>
                    <span>Mit Google anmelden</span>
                </button>
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </div>
        </div>
    );
};

export default LoginPage;
