import { GraphData } from '../shared/types';
import { GraphInfoBox } from './GraphInfoBox';
import LoadingSpinner from './LoadingSpinner';

interface GraphsListProps {
  graphs: GraphData[];
}

// TODO This should be paginated
// TODO This should be sorted by most recent
// TODO If the list of graphs is empty, show a message
export const GraphsList = ({ graphs }: GraphsListProps) => {
  return (
    <div className="flex flex-col mx-auto w-full">
      {graphs.length > 0 ? (
        <div className="border-b border-stone-200">
          {graphs.map(graph => (
            <GraphInfoBox key={graph.id} {...graph} />
          ))}
        </div>
      ) : (
        <LoadingSpinner className="mt-4" />
      )}
    </div>
  );
};
