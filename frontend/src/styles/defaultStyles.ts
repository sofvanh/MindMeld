const secondaryButtonColors = "text-stone-700 hover:text-stone-900 hover:bg-stone-100";
const linkButtonColors = "text-sky-500 hover:text-sky-600";
const emeraldButtonColors = "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50";
const redButtonColors = "text-red-500 hover:text-red-600 hover:bg-red-50";
const amberButtonColors = "text-amber-500 hover:text-amber-600 hover:bg-amber-50";
const baseIconButtonClasses = `p-0 w-6 h-6 flex items-center justify-center`;

export const buttonStyles = {
  primary: `bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4`,
  secondary: `${secondaryButtonColors} py-2 px-4`,
  link: `${linkButtonColors} py-2 px-4`,
  green: `${emeraldButtonColors} py-2 px-4`,
  red: `${redButtonColors} py-2 px-4`,
  amber: `${amberButtonColors} py-2 px-4`,
  icon: {
    base: `${baseIconButtonClasses}`,
    default: `${baseIconButtonClasses} ${secondaryButtonColors}`,
    green: `${baseIconButtonClasses} ${emeraldButtonColors}`,
    red: `${baseIconButtonClasses} ${redButtonColors}`,
    amber: `${baseIconButtonClasses} ${amberButtonColors}`,
  }
};

export const iconClasses = "w-full h-full";

export const tooltipClasses = `
  relative
  before:z-10
  before:leading-tight
  before:content-[attr(data-tooltip)]
  before:absolute
  before:top-[100%]
  before:left-1/2
  before:-translate-x-1/2
  before:mt-1
  before:bg-stone-700
  before:text-white
  before:px-2
  before:py-1
  before:rounded
  before:text-xs
  before:text-center
  before:font-normal
  before:normal-case
  before:tracking-normal
  before:font-sans
  before:whitespace-normal
  before:max-w-[30vw]
  before:w-max
  before:break-words
  before:opacity-0
  hover:before:opacity-90
  before:transition-opacity
  before:pointer-events-none
`;

const interactiveCardClasses = `
  card hover:shadow-md transition-shadow cursor-pointer
`;

const subtleCardClasses = `
  bg-stone-50 border border-stone-200 rounded-lg p-4
`;

export const cardStyles = {
  default: `card`,
  interactive: interactiveCardClasses,
  subtle: subtleCardClasses
};

const tagClasses = `
  inline-flex items-center gap-1.5
  text-[11px] font-medium font-bitter
  tracking-wide uppercase
  border rounded-full px-2 h-6
  whitespace-nowrap
`;

export const tagStyles = {
  amber: `${tagClasses} text-amber-700 bg-amber-50 border-amber-200`,
  indigo: `${tagClasses} text-indigo-700 bg-indigo-50 border-indigo-200`,
  sky: `${tagClasses} text-sky-700 bg-sky-50 border-sky-200`
}
