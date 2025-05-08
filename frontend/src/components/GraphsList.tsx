import { PiWarningDuotone } from 'react-icons/pi';
import { GraphData } from '../shared/types';
import { GraphCard } from './GraphCard';
import LoadingSpinner from './LoadingSpinner';

interface GraphsListProps {
  graphs?: GraphData[];
  error?: string;
}

// TODO This should be paginated
export const GraphsList = ({ graphs, error }: GraphsListProps) => {
  if (error) {
    return (
      <div className="flex flex-col flex-grow text-center items-center justify-center p-8 border border-red-200 border-[2px] rounded-lg shadow-sm">
        <PiWarningDuotone className="text-red-500 text-4xl mb-4" />
        <h3 className="mb-0">Couldn't load graphs</h3>
        <p><small>{error}</small></p>
      </div>
    )
  }

  if (!graphs) {
    return (
      <LoadingSpinner className="mt-4" />
    )
  }

  if (graphs.length === 0) {
    return (
      <div className="flex flex-col flex-grow text-center items-center justify-center p-8 border border-stone-300 border-[1px] rounded-lg shadow-sm">
        <h3 className="mb-0">No graphs found</h3>
        <p className="mb-0"><small>We couldn't find any graphs for this!</small></p>
      </div>
    )
  }

  return (
    <div className="flex flex-col mx-auto w-full gap-4">
      {graphs.map(graph =>
        <GraphCard key={graph.id} {...graph} />
      )}
    </div>
  );
};
