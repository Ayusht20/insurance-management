import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { getPoliciesByStatus } from "../../services/reportService";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = { active: "#22c55e", expired: "#eab308", cancelled: "#ef4444" };

export default function PolicyStatusChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getPoliciesByStatus().then((res) => setData(res.data)).catch(() => {});
  }, []);

  const chartData = {
    labels: data.map((d) => d.status),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((d) => COLORS[d.status] || "#94a3b8"),
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="font-semibold mb-3">Policies by Status</h2>
      {data.length > 0 ? <Pie data={chartData} /> : <p className="text-sm text-slate-400">No data yet</p>}
    </div>
  );
}