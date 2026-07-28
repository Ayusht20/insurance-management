import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { getCustomerGrowth } from "../../services/reportService";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function CustomerGrowthChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getCustomerGrowth().then((res) => setData(res.data)).catch(() => {});
  }, []);

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "New Customers",
        data: data.map((d) => d.count),
        borderColor: "#8b5cf6",
        backgroundColor: "#8b5cf6",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="font-semibold mb-3">Customer Growth</h2>
      {data.length > 0 ? <Line data={chartData} /> : <p className="text-sm text-slate-400">No data yet</p>}
    </div>
  );
}