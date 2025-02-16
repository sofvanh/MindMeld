import React from 'react';
import TabButton from './TabButton';
import { PiCardsThree } from "react-icons/pi";
import { PiGraphDuotone } from "react-icons/pi";

interface ViewSelectorProps {
  graphId: string;
  currentView: 'feed' | 'graph';
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ graphId, currentView }) => {
  return (
    <div className="flex border-t border-stone-200">
      <TabButton
        label="Feed"
        icon={PiCardsThree}
        to={`/feed/${graphId}`}
        color={currentView === 'feed' ? 'text-emerald-500' : 'text-stone-700'}
      />
      <TabButton
        label="Graph"
        icon={PiGraphDuotone}
        to={`/graph/${graphId}`}
        color={currentView === 'graph' ? 'text-emerald-500' : 'text-stone-700'}
      />
    </div>
  );
};

export default ViewSelector;
