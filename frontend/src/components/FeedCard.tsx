import { buttonStyles, iconClasses, tooltipClasses } from '../styles/defaultStyles';
import { IoIosThumbsUp, IoIosThumbsDown } from 'react-icons/io';
import { MdOutlineQuestionMark } from "react-icons/md";

export const FeedCard = ({ statement }: { statement: string }) => {
  return (
    <div className="bg-white px-4 rounded-lg shadow-md border min-h-52 flex flex-col">
      <div className="text-stone-700 flex-1 overflow-auto text-center py-2 flex items-center justify-center">
        <p className="w-full">{statement}</p>
      </div>
      <div className="flex-0 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center justify-items-center mb-2 content-center">
        <div className="hidden sm:block"></div>
        <button
          className={`${buttonStyles.icon.green} ${tooltipClasses} min-h-11 w-full border-[0.5px] border-emerald-500`}
          data-tooltip="I agree with this"
          aria-label="Agree"
        >
          <IoIosThumbsUp className={`${iconClasses} max-w-4 mr-2`} /> Agree
        </button>
        <button
          className={`${buttonStyles.icon.red} ${tooltipClasses} min-h-11 w-full border-[0.5px] border-rose-500`}
          data-tooltip="I don't agree with this"
          aria-label="Disagree"
        >
          <IoIosThumbsDown className={`${iconClasses} max-w-4 mr-2`} /> Disagree
        </button>
        <div className="block sm:hidden"></div>
        <button
          className={`${buttonStyles.icon.default} ${tooltipClasses} min-h-11 w-full`}
          data-tooltip="This argument is unclear or poor quality"
          aria-label="Unclear"
        >
          <MdOutlineQuestionMark className={`${iconClasses} max-w-4 mr-2`} /> Unclear
        </button>
      </div>
    </div >
  );
}
