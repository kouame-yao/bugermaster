import { useEffect, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { useAuth } from "../context/AuthContext";

const DonutChartMobileFriendly = ({ data }) => {
  const url = process.env.NEXT_PUBLIC_LOCAL;
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [getDev, setGetdev] = useState([]);

  useEffect(() => {
    async function getDevise() {
      if (!uid) return;
      const r = await fetch(`${url}/api/devise/getdevise`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });
      const data = await r.json();
      setGetdev(data?.data || {});
    }
    getDevise();
  }, [uid, url]);

  const [selected, setSelected] = useState(null);

  const total = data.reduce((acc, curr) => acc + curr.valeur, 0);

  const handleClick = (entry, index) => {
    setSelected({
      ...entry,
      pourcentage: ((entry.valeur / total) * 100).toFixed(1),
    });
  };

  return (
    <div className="relative flex  md:flex-row items-center justify-center gap-6">
      <PieChart width={250} height={250}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="valeur"
          onClick={handleClick}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.couleur}
              onClick={() => handleClick(entry, index)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </Pie>
      </PieChart>

      {/* Légendes */}
      <div className="space-y-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: entry.couleur }}
            ></div>
            <span className="text-sm font-medium">{entry.nom}</span>
          </div>
        ))}
      </div>

      {/* Tooltip personnalisé pour mobile */}
      {selected && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white border shadow-md rounded-lg px-4 py-2 text-sm z-10">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: selected.couleur }}
            ></div>
            <span className="font-semibold">{selected.nom}</span>
          </div>
          <div>{selected.pourcentage}% du total</div>
        </div>
      )}
    </div>
  );
};

export default DonutChartMobileFriendly;
