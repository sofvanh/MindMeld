import React from 'react';
import { FiGitBranch, FiList } from 'react-icons/fi';
import TabButton from './TabButton';

interface ViewSelectorProps {
  graphId: string;
  currentView: 'feed' | 'graph';
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ graphId, currentView }) => {
  return (
    <div className="flex h-10 border-t border-stone-200">
      <TabButton
        label="Feed"
        icon={FiList}
        to={`/feed/${graphId}`}
        color={currentView === 'feed' ? 'text-emerald-500' : 'text-stone-700'}
      />
      <TabButton
        label="Graph"
        icon={FiGitBranch}
        to={`/graph/${graphId}`}
        color={currentView === 'graph' ? 'text-emerald-500' : 'text-stone-700'}
      />
    </div>
  );
};

export default ViewSelector;
