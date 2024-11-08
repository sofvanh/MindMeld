import React from 'react';
import { IoIosClose } from "react-icons/io";
import { iconClasses, iconButtonClasses } from '../styles/defaultStyles';

interface CloseButtonProps {
  onClick: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className={iconButtonClasses}>
      <IoIosClose className={iconClasses} />
    </button>
  );
};

export default CloseButton;
