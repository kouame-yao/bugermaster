import { useEffect, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { useAuth } from "../context/AuthContext";

const SoldeDonutChart = ({ total, depense }) => {
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [getDev, setGetdev] = useState([]);

  // Récupération de l'URL depuis l'environnement
  const url = process.env.NEXT_PUBLIC_LOCAL;

  useEffect(() => {
    if (!uid) return;
    async function getDevise() {
      const r = await fetch(`${url}/api/devise/getdevise`, {
        // <- ici la variable url devant l'API
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

  const reste = total - depense;
  const pourcentageDepense = ((depense / total) * 100).toFixed(1);
  const pourcentageReste = ((reste / total) * 100).toFixed(1);

  const data = [
    { name: "Dépensé", value: depense },
    { name: "Reste", value: reste },
  ];

  const COLORS = ["#FFA500", "#d3d3d3"]; // Orange pour dépensé, gris clair pour le reste

  return (
    <div className="flex flex-col items-center justify-center relative w-[250px] h-[250px]">
      <PieChart width={250} height={250}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={90}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index]}
              cornerRadius={10}
            />
          ))}
        </Pie>
      </PieChart>
      <div className="absolute text-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="text-lg font-semibold text-orange-500">
          {depense?.toLocaleString("fr-FR")} {getDev?.devise}
        </div>
        <div className="text-sm text-gray-500">
          sur {total?.toLocaleString("fr-FR")} {getDev?.devise}
        </div>
        <div className="text-xs text-gray-400">{pourcentageDepense} %</div>
      </div>
      <div className="absolute bottom-4 text-sm text-gray-600">
        Reste : {reste?.toLocaleString("fr-FR")} {getDev?.devise} (
        {pourcentageReste} %)
      </div>
    </div>
  );
};

export default SoldeDonutChart;
