import { Link } from 'react-router-dom';
import { GraphData } from '../shared/types';
import { formatDate } from '../utils/time';
import { PiArrowRight } from 'react-icons/pi';
import { getActivityColor } from '../utils/colors';

export const GraphCard = ({ id, name, argumentCount, reactionCount, lastActivity }: GraphData) => {
  return (
    <Link to={`/feed/${id}`} className="block">
      <div className="
      p-4 bg-white
      border border-stone-200 rounded-lg shadow-sm
      hover:bg-[rgba(16,185,129,0.02)]
      hover:border-emerald-500
      hover:shadow-md
      transition-all duration-150 group
      ">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="m-0 text-stone-800 transition-colors duration-150">{name}</h4>
            <div className="mt-2 flex flex-wrap">
              <small className="mr-2">
                <span className="font-bold">{argumentCount}</span> statement{argumentCount !== 1 ? 's' : ''}
              </small>
              <small className="mr-2">
                <span className="font-bold">{reactionCount}</span> reaction{argumentCount !== 1 ? 's' : ''}
              </small>
              <div className="flex-grow"></div>
              <small>
                Last activity: <span style={{ color: getActivityColor(lastActivity) }} className="font-bold">
                  {lastActivity ? formatDate(lastActivity) : 'never'}
                </span>
              </small>
            </div>
          </div>
          <div className="text-stone-400 group-hover:text-emerald-700 transition-colors duration-150">
            <PiArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
};
