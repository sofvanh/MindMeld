import React, { useState } from 'react';
import { buttonStyles } from '../styles/defaultStyles';

interface ArgumentFormProps {
  onSubmit: (argument: string) => void;
}

const ArgumentForm: React.FC<ArgumentFormProps> = ({ onSubmit }) => {
  const [newArgument, setNewArgument] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newArgument.trim()) {
      onSubmit(newArgument.trim());
      setNewArgument('');
    }
  };

  return (
    <form className="flex gap-2 w-full" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter new argument"
        className="flex-1 shadow-md"
        onChange={(e) => setNewArgument(e.target.value)}
        value={newArgument}
      />
      <button type="submit" className={`${buttonStyles.primary} shadow-md`}>
        Add
      </button>
    </form>
  );
};

export default ArgumentForm;