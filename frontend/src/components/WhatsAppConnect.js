import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";
import { io } from "socket.io-client";
import "./WhatsAppConnect.css";

// 🔌 Socket instance (singleton)
const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    withCredentials: true,
    reconnectionAttempts: 5,
    timeout: 10000,
    autoConnect: false,
});

const WhatsAppConnect = ({ businessId, onStatusChange }) => {
    const [qrCode, setQrCode] = useState(null);
    const [status, setStatus] = useState("idle");
    // idle | loading | qr | connected | error
    const [error, setError] = useState(null);

    const getAuthToken = () => {
        try {
            const userData = JSON.parse(localStorage.getItem("user"));
            return userData?.token || null;
        } catch {
            return null;
        }
    };

    // 🔄 Récupérer le statut actuel (exposable pour réappels)
    const fetchCurrentStatus = async () => {
        if (!businessId) return;
        const token = getAuthToken();
        if (!token) return;

        try {
            const res = await axios.get(
                "http://localhost:5000/api/whatsapp/status",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { status: serverStatus, qr } = res.data;

            if (serverStatus === "ready") {
                setStatus("connected");
                setQrCode(null);
            } else if (serverStatus === "qr" && qr) {
                setQrCode(qr);
                setStatus("qr");
            } else if (serverStatus === "loading") {
                setStatus("loading");
            } else if (serverStatus === "failed") {
                setError("L'initialisation de WhatsApp a échoué. Veuillez réessayer.");
                setStatus("error");
            }
        } catch (err) {
            console.log("Pas de session WhatsApp active.");
        }
    };

    // Appel initial au montage
    useEffect(() => {
        fetchCurrentStatus();
    }, [businessId]);

    // Notify parent about status changes (optional)
    useEffect(() => {
        if (typeof onStatusChange === 'function') onStatusChange(status);
    }, [status, onStatusChange]);

    // 🔌 Socket : mises à jour en temps réel
    useEffect(() => {
        if (!businessId) return;

        // ✅ Fonction pour rejoindre la room (appelée quand le socket est prêt)
        const joinRoom = () => {
            console.log("🏠 Rejoindre la room:", businessId);
            socket.emit("join-business-room", businessId);
            // Après avoir rejoint, forcer une nouvelle récupération du statut
            // (évite de rater un QR émis juste avant que l'on rejoigne)
            fetchCurrentStatus();
        };

        socket.onAny((event, ...args) => {
            console.log("📡 Socket event:", event, args);
        });

        // Rejoindre la room dès que la connexion est établie
        socket.on("connect", joinRoom);

        // Si le socket est déjà connecté (singleton réutilisé), rejoindre immédiatement
        if (socket.connected) {
            joinRoom();
        } else {
            socket.connect();
        }

        // QR reçu en temps réel
        socket.on("whatsapp-qr", (data) => {
            console.log("✅ QR reçu:", data.qr?.substring(0, 30) + "...");
            setQrCode(data.qr);
            setStatus("qr");
        });

        // Changement de statut WhatsApp
        socket.on("whatsapp-status", (data) => {
            console.log("Status:", data.status);

            if (data.status === "ready" || data.status === "authenticated") {
                setStatus("connected");
                setQrCode(null);
            }

            if (data.status === "disconnected") {
                setStatus("idle");
                setQrCode(null);
            }

            if (data.status === "failed") {
                setError("Échec d'authentification. Réessayez.");
                setStatus("error");
            }
        });

        return () => {
            socket.off("connect", joinRoom);
            socket.off("whatsapp-qr");
            socket.off("whatsapp-status");
            socket.offAny();
        };
    }, [businessId]);

    const connectWhatsApp = async () => {
        const token = getAuthToken();

        if (!token) {
            setError("Aucun utilisateur trouvé. Reconnectez-vous.");
            setStatus("error");
            return;
        }

        try {
            setStatus("loading");
            setError(null);

            await axios.post(
                "http://localhost:5000/api/whatsapp/connect",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("🚀 Connexion lancée");

        } catch (err) {
            console.error("Erreur:", err);
            setError("Erreur lors de la connexion.");
            setStatus("error");
        }
    };

    return (
        <div className="whatsapp-connect">
            <h2>WhatsApp Business</h2>
            <hr />

            {status === "connected" ? (
                <div className="notification success">
                    <p>✅ Votre WhatsApp est connecté et prêt.</p>
                </div>
            ) : (
                <div className="connect-container">

                    {/* IDLE */}
                    {status === "idle" && (
                        <button
                            className="connect-button"
                            onClick={connectWhatsApp}
                        >
                            Démarrer la connexion
                        </button>
                    )}

                    {/* LOADING */}
                    {status === "loading" && (
                        <div className="status-message">
                            <div className="spinner"></div>
                            <p>Initialisation de WhatsApp...</p>
                        </div>
                    )}

                    {/* QR */}
                    {status === "qr" && qrCode && (
                        <div className="qr-code-container">
                            <p>Scannez ce QR Code :</p>

                            <div className="qr-wrapper">
                                <QRCodeSVG value={qrCode} size={256} includeMargin />
                            </div>

                            <button
                                className="cancel-button"
                                onClick={() => {
                                    setStatus("idle");
                                    setQrCode(null);
                                }}
                            >
                                Annuler
                            </button>
                        </div>
                    )}

                    {/* ERROR */}
                    {status === "error" && (
                        <div className="notification error">
                            <p>❌ {error || "Une erreur est survenue."}</p>

                            <button onClick={() => setStatus("idle")}>
                                Réessayer
                            </button>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

export default WhatsAppConnect;