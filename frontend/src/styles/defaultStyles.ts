const secondaryButtonColors = "text-slate-700 hover:text-slate-900 hover:bg-slate-100";
const greenButtonColors = "text-green-600 hover:text-green-700 hover:bg-green-50";
const redButtonColors = "text-red-500 hover:text-red-600 hover:bg-red-50";
const amberButtonColors = "text-amber-500 hover:text-amber-600 hover:bg-amber-50";
const baseIconButtonClasses = `p-0 w-6 h-6 flex items-center justify-center`;

export const buttonStyles = {
  primary: `bg-blue-500 hover:bg-blue-600 text-white py-2 px-4`,
  secondary: `${secondaryButtonColors} py-2 px-4`,
  green: `${greenButtonColors} py-2 px-4`,
  red: `${redButtonColors} py-2 px-4`,
  amber: `${amberButtonColors} py-2 px-4`,
  icon: {
    base: `${baseIconButtonClasses}`,
    default: `${baseIconButtonClasses} ${secondaryButtonColors}`,
    green: `${baseIconButtonClasses} ${greenButtonColors}`,
    red: `${baseIconButtonClasses} ${redButtonColors}`,
    amber: `${baseIconButtonClasses} ${amberButtonColors}`,
  }
};

export const iconClasses = "w-full h-full";

export const tooltipClasses = `
relative before:content-[attr(data-tooltip)] before:absolute 
before:top-[-35px] before:left-1/2 before:-translate-x-1/2
before:bg-slate-700 before:text-white before:px-2 before:py-1 
before:rounded before:text-xs before:whitespace-nowrap
before:opacity-0 hover:before:opacity-100 before:transition-opacity
before:pointer-events-none
`;

const interactiveCardClasses = `
  card hover:shadow-md transition-shadow cursor-pointer
`;

const subtleCardClasses = `
  bg-slate-50 border border-slate-200 rounded-lg p-4
`;

export const cardStyles = {
  default: `card`,
  interactive: interactiveCardClasses,
  subtle: subtleCardClasses
};