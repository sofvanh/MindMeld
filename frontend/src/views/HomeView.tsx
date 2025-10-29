import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { FeaturedDiscussionsList } from '../components/FeaturedDiscussionsList';


const HomeView: React.FC = () => {
  usePageTitle();

  return (
    <div className="px-4 max-w-screen-md mx-auto">
      <div className="my-16">
        <h1>Prototyping Online Discourse Aggregation</h1>
        <h4 className="text-stone-500 mb-8">
          Exploring AI-powered conversation analysis with Nexus
        </h4>
        <p>
          This prototype demonstrates how AI embeddings and semantic analysis can be used to aggregate and understand online discourse. Using OpenAI embeddings, statements are clustered by similarity and visualized as connected networks of related ideas.
        </p>
        <p>
          The prototype showcases real conversation data processed through AI to reveal thematic patterns, consensus levels, and argument relationships that emerge naturally from group discussions.
        </p>
      </div>
      <div className="my-24">
        <FeaturedDiscussionsList />
      </div>
    </div >
  );
};

export default HomeView;
