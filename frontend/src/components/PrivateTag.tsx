import { PiLockSimple } from 'react-icons/pi';
import { tooltipClasses } from '../styles/defaultStyles';

interface PrivateTagProps {
  className?: string;
}

export const PrivateTag = ({ className = '' }: PrivateTagProps) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        text-[11px] font-medium font-bitter
        tracking-wide uppercase
        text-indigo-700 bg-indigo-50
        border border-indigo-200
        rounded-full px-2 h-6
        ${tooltipClasses}
        ${className}
      `}
      data-tooltip="This graph is only accessible to whitelisted users"
    >
      <PiLockSimple className="w-2.5 h-2.5" />
      Private
    </span>
  );
};
