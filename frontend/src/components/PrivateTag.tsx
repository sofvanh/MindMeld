import { PiLockSimple } from 'react-icons/pi';
import { tagStyles, tooltipClasses } from '../styles/defaultStyles';

interface PrivateTagProps {
  className?: string;
}

export const PrivateTag = ({ className = '' }: PrivateTagProps) => {
  return (
    <span
      className={`
        ${tagStyles.indigo}
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
