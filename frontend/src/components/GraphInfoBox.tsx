import { Link } from 'react-router-dom';
import { GraphData } from '../shared/types';
import { formatDate } from '../utils/time';

export const GraphInfoBox = ({ id, name, argumentCount, lastActivity }: GraphData) => {
  return (
    <Link to={`/graph/${id}`} className="block">
      <div className="py-4 bg-white hover:bg-stone-50 transition-colors duration-100 text-stone-700 border-t border-stone-200">
        <h4 className="m-0 text-base">{name}</h4>
        <div className="text-sm text-stone-500 flex justify-between">
          <span>
            {argumentCount} argument{argumentCount !== 1 ? 's' : ''}
          </span>
          <span>
            Last activity: {lastActivity ? formatDate(lastActivity) : 'never'}
          </span>
        </div>
      </div>
    </Link>
  );
};
