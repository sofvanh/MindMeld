import { Link } from 'react-router-dom';

interface TabButtonProps {
  label: string;
  icon: React.ElementType;
  to: string;
  color?: string;
}

const TabButton = ({ label, icon: Icon, to, color = 'text-stone-700' }: TabButtonProps) => {
  const borderColor = color.replace('text-', 'border-');

  return (
    <Link
      to={to}
      className={`flex items-center justify-center gap-2 px-4 py-3
        border-b-[4px] ${borderColor}
        rounded-none flex-grow`}
      title={label}
    >
      <Icon className={`w-5 h-5 ${color}`} />
      <span className={`${color} font-semibold hidden sm:inline`}>{label}</span>
    </Link>
  );
};

export default TabButton;
