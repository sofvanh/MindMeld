import { Link } from 'react-router-dom';
import { Graph } from '../shared/types';
import { buttonStyles } from '../styles/defaultStyles';

export const GraphInfoBox = ({ id, name, arguments: args = [] }: Graph) => {
  return (
    <Link to={`/graph/${id}`} className="block">
      <div className="py-4 bg-white hover:bg-stone-50 transition-colors duration-100 text-stone-700 border-t border-stone-200">
        <h4 className="m-0 text-base">{name}</h4>
        <div className="text-sm text-stone-500 flex justify-between">
          <span>
            {args.length} argument{args.length !== 1 ? 's' : ''}
          </span>
          <span>
            Last activity: 10 days ago
          </span>
        </div>
      </div>
    </Link>
  );
};
