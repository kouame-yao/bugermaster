import { AlertCircleIcon, AlertTriangleIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const url = process.env.NEXT_PUBLIC_LOCAL; // base URL de l'API

export default function Notification() {
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [Alertes, setAlertes] = useState([]);
  const router = useRouter();
  const divRef = useRef();

  useEffect(() => {
    fetchAlertes();
  }, [uid]);

  async function fetchAlertes() {
    if (!uid) return;
    try {
      const r = await fetch(`${url}/api/alertes/alerteurgent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await r.json();
      setAlertes(data?.table || []);
    } catch (error) {
      console.error("Erreur fetch alertes:", error);
    }
  }

  async function markAllAsRead() {
    if (!uid) return;
    try {
      const response = await fetch(`${url}/api/alertes/vue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      if (!response.ok) {
        const text = await response.text();
        console.error("Erreur markAllAsRead:", text);
      }
      fetchAlertes();
    } catch (err) {
      console.error("Erreur réseau :", err);
    }
  }

  const nombre = Alertes?.filter((item) => !item.read).length;

  if (loading) return <p>Chargement en cours...</p>;
  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <div className="mt-15">
      <div className="flex justify-between px-3">
        <span>Notification</span>
        <span>{nombre} non lues</span>
      </div>

      <div className="mt-4">
        {Alertes?.map((item, index) => {
          const vue = item.read === false ? "bg-blue-100" : "bg-gray-100";
          const icone =
            item.type === "statistique" ? (
              <AlertTriangleIcon className="bg-orange-500 rounded-full text-orange-100" />
            ) : item.type === "alerte" ? (
              <AlertCircleIcon className="bg-red-500 rounded-full text-red-100" />
            ) : item.type === "rappel" ? (
              <AlertCircleIcon className="bg-blue-500 rounded-full text-blue-100" />
            ) : (
              0
            );
          return (
            <div
              key={index}
              className={`flex ${vue} justify-between py-2 px-3 border-t border-gray-300`}
            >
              <span>{icone}</span>
              <div className="flex flex-col gap-1">
                <strong>{item.title}</strong>
                <span>{item.message}</span>
                <span>{item.createdAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-300 py-3 flex flex-col gap-5 px-3">
        <div className="flex justify-center items-center text-blue-700 cursor-pointer">
          <span onClick={markAllAsRead}>Tout marquer comme lu</span>
        </div>
        <div
          className="flex justify-center items-center py-2 rounded-md bg-blue-700 text-white cursor-pointer"
          onClick={() => router.push("/alerts")}
        >
          <span>Voir toutes les notifications</span>
        </div>
      </div>
    </div>
  );
}
