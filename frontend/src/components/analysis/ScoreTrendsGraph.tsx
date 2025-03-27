import { useMemo } from "react";
import { useGraphContext } from "../../contexts/GraphContext";
import { Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js";
import { CategoryScale } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const ScoreTrendsGraph: React.FC = () => {
  const { graph } = useGraphContext();

  const trendData = useMemo(() => {
    if (!graph) return { labels: [], consensusData: [], divergenceData: [] };

    // Filter arguments that have both consensus and fragmentation scores
    // and are above a quality threshold (clarity > 0.5)
    const filteredArgs = graph.arguments
      .filter(arg =>
        arg.score?.consensus !== undefined &&
        arg.score?.fragmentation !== undefined &&
        (arg.score?.clarity || 0) > 0.5
      )
      // Sort by ID (which represents time order)
      .sort((a, b) => a.id.localeCompare(b.id));

    // If we don't have enough data points, return empty data
    if (filteredArgs.length < 3) {
      return { labels: [], consensusData: [], divergenceData: [] };
    }

    // Extract scores
    const labels = filteredArgs.map(argument => argument.statement.substring(0, 16) + '...');
    const consensusData = filteredArgs.map(arg => arg.score?.consensus || 0);
    const divergenceData = filteredArgs.map(arg => arg.score?.fragmentation || 0);

    // Calculate minimum width based on number of statements (30px per statement)
    // with a minimum of 400px and maximum of 2000px
    const minWidth = Math.min(Math.max(filteredArgs.length * 30, 400), 2000);

    return { labels, consensusData, divergenceData, minWidth };
  }, [graph]);

  // Chart configuration
  const chartOptions = {
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1.0,
        title: {
          display: true,
          text: 'Score'
        },
        grid: {
          display: false
        }
      },
      x: {
        title: {
          display: true,
          text: 'Statements in order of appearance'
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: (items: any[]) => {
            const index = items[0].dataIndex;
            const filteredArgs = graph?.arguments
              .filter(arg =>
                arg.score?.consensus !== undefined &&
                arg.score?.fragmentation !== undefined &&
                (arg.score?.clarity || 0) > 0.5
              )
              .sort((a, b) => a.id.localeCompare(b.id));
            return filteredArgs?.[index]?.statement || items[0].label;
          }
        }
      }
    }
  };

  const chartData = {
    labels: trendData.labels as string[],
    datasets: [
      {
        label: 'Consensus',
        data: trendData.consensusData as number[],
        borderColor: 'rgb(16, 185, 129)', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Divergence',
        data: trendData.divergenceData as number[],
        borderColor: 'rgb(249, 115, 22)', // orange-500
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        tension: 0.4,
      },
    ],
  };

  return (
    <>
      {trendData.labels.length > 0 ? (
        <div className="bg-white rounded-lg sm:shadow-sm sm:border sm:border-stone-200 sm:p-4 mb-6">
          <h4>Consensus and Divergence Trends</h4>
          <small className="block mb-4">
            Shows how consensus and divergence scores evolve across statements over time.
            Statements without enough votes or below a quality threshold are filtered out.
          </small>
          <div className="relative">
            <div className="overflow-x-auto">
              <div className="px-8" style={{ minWidth: `${trendData.minWidth}px` }}>
                <Line options={chartOptions} data={chartData} />
              </div>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-white pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-stone-500">
          <p>Not enough data to display trend chart.</p>
          <p className="text-sm mt-2">Need more statements with sufficient reactions.</p>
        </div>
      )}
    </>
  );
};
