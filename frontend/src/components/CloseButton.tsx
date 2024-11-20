import React from 'react';
import { IoIosClose } from "react-icons/io";
import { buttonStyles, iconClasses } from '../styles/defaultStyles';

interface CloseButtonProps {
  onClick: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className={buttonStyles.icon.default}>
      <IoIosClose className={iconClasses} />
    </button>
  );
};

export default CloseButton;
