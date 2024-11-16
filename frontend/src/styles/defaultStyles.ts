const defaultButtonClasses = `
  font-sans font-medium rounded
  transition-colors duration-200 ease-in-out
  whitespace-normal break-words
`;

export const primaryButtonClasses = `
  ${defaultButtonClasses} bg-blue-500 hover:bg-blue-600 text-white py-2 px-4
`;

const secondaryButtonColors = "text-slate-700 hover:text-slate-900 hover:bg-slate-100";
export const greenButtonColors = "text-green-600 hover:text-green-700 hover:bg-green-50";
export const redButtonColors = "text-red-500 hover:text-red-600 hover:bg-red-50";
export const amberButtonColors = "text-amber-500 hover:text-amber-600 hover:bg-amber-50";
export const secondaryButtonClasses = `
  ${defaultButtonClasses} ${secondaryButtonColors} py-2 px-4
`;

export const baseIconButtonClasses = `${defaultButtonClasses} p-0 w-6 h-6 flex items-center justify-center`;

export const iconButtonClasses = `${baseIconButtonClasses} ${secondaryButtonColors}`;
export const greenIconButtonClasses = `${baseIconButtonClasses} ${greenButtonColors}`;
export const redIconButtonClasses = `${baseIconButtonClasses} ${redButtonColors}`;
export const amberIconButtonClasses = `${baseIconButtonClasses} ${amberButtonColors}`;

export const iconClasses = "w-full h-full";

export const textFieldClasses =
  "px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm";

export const tooltipClasses = `
relative before:content-[attr(data-tooltip)] before:absolute 
before:top-[-35px] before:left-1/2 before:-translate-x-1/2
before:bg-slate-700 before:text-white before:px-2 before:py-1 
before:rounded before:text-xs before:whitespace-nowrap
before:opacity-0 hover:before:opacity-100 before:transition-opacity
before:pointer-events-none
`;