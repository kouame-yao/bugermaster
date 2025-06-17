import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";

const url = process.env.NEXT_PUBLIC_LOCAL;

const CustomTooltip = ({ active, payload, label }) => {
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [getDev, setGetdev] = useState([]);

  useEffect(() => {
    async function getDevise() {
      if (!uid) return;
      try {
        const r = await fetch(`${url}/api/devise/getdevise`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid: uid }),
        });
        const data = await r.json();
        setGetdev(data?.data || {});
      } catch (error) {
        console.error("Erreur lors de la récupération de la devise:", error);
      }
    }
    getDevise();
  }, [uid]);

  if (active && payload && payload.length) {
    return (
      <div className="bg-white border shadow p-3 rounded text-sm">
        <p className="font-semibold">Mois : {label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name} : {entry?.value?.toLocaleString("fr-FR")}{" "}
            {getDev?.devise}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function LineChartDepenses({
  data,
  color2024 = "#3B82F6",
  color2025 = "#10B981",
}) {
  return (
    <div className="w-full h-[400px] bg-white">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mois" />
          <YAxis domain={[0, 500000]} tickFormatter={(val) => `${val}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="y2024"
            name="Année 2024"
            stroke={color2024}
            activeDot={{ r: 8 }}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="y2025"
            name="Année 2025"
            stroke={color2025}
            activeDot={{ r: 8 }}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
