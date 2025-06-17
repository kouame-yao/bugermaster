import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";

const COLORS = [
  "#FF8042",
  "#00C49F",
  "#FFBB28",
  "#0088FE",
  "#A28DFF",
  "#FF69B4",
];

export default function ReversedBarChart({ data }) {
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [getDev, setGetdev] = useState([]);

  // Ici, on utilise la variable d'env pour la base URL
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

      setGetdev(data?.data || {});
    }
    getDevise();
  }, [uid, url]);

  const dev = getDev?.devise;
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 80, left: 50, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={{ dy: 15, fontSize: 14 }}
          />
          <Tooltip
            formatter={(value) => `${value?.toLocaleString("fr-FR")} ${dev}`}
          />
          <Bar dataKey="montant" radius={[10, 10, 10, 10]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
            <LabelList
              dataKey="montant"
              position="right"
              formatter={(value) => `${value?.toLocaleString("fr-FR")} ${dev}`}
              style={{ fill: "#333", fontWeight: "bold", fontSize: 14 }}
              offset={10}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
