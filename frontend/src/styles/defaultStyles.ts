const defaultButtonClasses = `
  font-sans font-normal rounded
  transition-colors duration-200 ease-in-out
  whitespace-normal break-words
`;

export const primaryButtonClasses = `
  ${defaultButtonClasses} bg-stone-500 hover:bg-stone-700 text-white py-2 px-4
`;

const secondaryButtonColors = "text-stone-500 hover:text-stone-700 hover:bg-black hover:bg-opacity-5";
export const greenButtonColors = "text-green-500 hover:text-green-700 hover:bg-green-500 hover:bg-opacity-5";
export const redButtonColors = "text-red-500 hover:text-red-700 hover:bg-red-500 hover:bg-opacity-5";

export const secondaryButtonClasses = `
  ${defaultButtonClasses} ${secondaryButtonColors} py-2 px-4
`;

export const baseIconButtonClasses = `${defaultButtonClasses} p-0 w-6 h-6 flex items-center justify-center`;

export const iconButtonClasses = `${baseIconButtonClasses} ${secondaryButtonColors}`;
export const greenIconButtonClasses = `${baseIconButtonClasses} ${greenButtonColors}`;
export const redIconButtonClasses = `${baseIconButtonClasses} ${redButtonColors}`;

export const iconClasses = "w-full h-full";

export const textFieldClasses =
  "px-3 py-2 border rounded-md text-stone-700 focus:outline-none focus:border-stone-500 text-sm";