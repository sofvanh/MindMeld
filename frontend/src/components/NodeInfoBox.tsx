import React from 'react';
import { defaultTextButtonClasses } from '../styles/defaultStyles';

interface NodeInfoBoxProps {
  statement: string;
  onClose: () => void;
}

const NodeInfoBox: React.FC<NodeInfoBoxProps> = ({ statement, onClose }) => {
  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[600px] px-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-start gap-4">
          <p className="text-sm text-stone-700 flex-1">{statement}</p>
          <button
            onClick={onClose}
            className={`${defaultTextButtonClasses} !p-1 min-w-8 flex items-center justify-center`}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeInfoBox;