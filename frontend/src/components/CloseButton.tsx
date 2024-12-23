import React from 'react';
import { IoIosClose } from "react-icons/io";
import { buttonStyles, iconClasses } from '../styles/defaultStyles';

interface CloseButtonProps {
  onClick: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className={`w-11 h-11 flex items-center justify-center p-3 text-stone-500`}>
      <IoIosClose className={`${iconClasses}`} />
    </button>
  );
};

export default CloseButton;
