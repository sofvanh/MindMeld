import { GraphData } from '../shared/types';
import { GraphCard } from './GraphCard';
import LoadingSpinner from './LoadingSpinner';

interface GraphsListProps {
  graphs: GraphData[];
}

// TODO This should be paginated
// TODO This should be sorted by most recent
// TODO If the list of graphs is empty, show a message
export const GraphsList = ({ graphs }: GraphsListProps) => {
  return (
    <div className="flex flex-col mx-auto w-full gap-4">
      {graphs.length > 0 ? (
        graphs.map(graph => (
          <GraphCard key={graph.id} {...graph} />
        ))
      ) : (
        <LoadingSpinner className="mt-4" />
      )}
    </div>
  );
};
