import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const ProgressBar = ({ depense, total }) => {
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [getDev, setGetdev] = useState([]);

  // Ajout de la variable url depuis l'environnement
  const url = process.env.NEXT_PUBLIC_LOCAL;

  useEffect(() => {
    async function getDevise() {
      if (!uid) return;
      const r = await fetch(`${url}/api/devise/getdevise`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: uid }),
      });
      const data = await r.json();

      setGetdev(data?.data || []);
    }
    getDevise();
  }, [uid, url]);

  const pourcentage = Math.min((depense / total) * 100, 100);

  // Détermine la couleur selon le niveau de dépense
  let barColor = "bg-green-500";
  if (pourcentage >= 80) barColor = "bg-red-500";
  else if (pourcentage >= 50) barColor = "bg-yellow-500";

  const reste = total - depense;
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-300 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full text-white text-sm font-medium text-center p-0.5 leading-6 ${barColor}`}
          style={{ width: `${pourcentage}%` }}
        >
          {Math.round(pourcentage)}%
        </div>
      </div>
      <div className="text-right mt-2 text-gray-400 ">
        Reste : {reste.toLocaleString("fr-FR")} {getDev?.devise}
      </div>
    </div>
  );
};

export default ProgressBar;
