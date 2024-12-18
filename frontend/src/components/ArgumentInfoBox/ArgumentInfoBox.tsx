import React, { useEffect, useState } from 'react';
import CloseButton from '../CloseButton';
import { Argument } from '../../shared/types';
import { useWebSocket } from '../../contexts/WebSocketContext';
import ArgumentInfoMedium from './ArgumentInfoMedium';


interface ArgumentInfoBoxProps {
  argument: Argument;
  onClose: () => void;
  onPrevArg: () => void;
  onNextArg: () => void;
  totalArgs: number;
  currentIndex: number;
}

const ArgumentInfoBox: React.FC<ArgumentInfoBoxProps> = ({
  argument,
  onClose,
  onPrevArg,
  onNextArg,
  totalArgs,
  currentIndex
}) => {
  const { socket } = useWebSocket();
  const [userReactions, setUserReactions] = useState(argument.userReaction || {});

  useEffect(() => {
    setUserReactions(argument.userReaction || {});
  }, [argument]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        onPrevArg();
      } else if (event.key === 'ArrowRight') {
        onNextArg();
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevArg, onNextArg, onClose]);

  const handleReactionClick = (type: 'agree' | 'disagree' | 'unclear') => {
    if (!socket) {
      console.error('No socket found');
      return;
    }
    const newValue = !userReactions[type];
    if (newValue) {
      socket.emit('add reaction', {
        argumentId: argument.id,
        type
      });
    } else {
      socket.emit('remove reaction', {
        argumentId: argument.id,
        type
      });
    }
  };

  return (
    <div>
      <ArgumentInfoMedium
        argument={argument}
        handleReaction={handleReactionClick}
        onPrevArg={onPrevArg}
        onNextArg={onNextArg}
        totalArgs={totalArgs}
        currentIndex={currentIndex}
      />
      <div className="absolute top-0 right-0 m-4">
        <CloseButton onClick={onClose} />
      </div>
    </div>
  );
};

export default ArgumentInfoBox;