import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { getMonthlyPremiumCollection } from "../../services/reportService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function PremiumCollectionChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getMonthlyPremiumCollection().then((res) => setData(res.data)).catch(() => {});
  }, []);

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Premium Collected (₹)",
        data: data.map((d) => d.total),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="font-semibold mb-3">Monthly Premium Collection</h2>
      {data.length > 0 ? <Bar data={chartData} /> : <p className="text-sm text-slate-400">No data yet</p>}
    </div>
  );
}