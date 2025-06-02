import React from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { buttonStyles, iconClasses } from "../../styles/defaultStyles";
import ViewSelector from "../ViewSelector";
import { GraphProvider, useGraphContext } from "../../contexts/GraphContext";
import { PrivateTag } from "../PrivateTag";
import { useAuth } from "../../contexts/AuthContext";
import { PiDownloadDuotone } from "react-icons/pi";

const GraphLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { graphId } = useParams<{ graphId: string }>();
  const { graph } = useGraphContext();
  const location = useLocation();
  const { user } = useAuth();

  const currentView = location.pathname.includes('/feed/') ? 'feed'
    : location.pathname.includes('/analysis/') ? 'analysis'
      : 'graph';

  const handleDownload = () => {
    if (!graph || user?.role !== 'admin') return;
    const { edges, ...graphWithoutEdges } = graph;
    const cleanGraph = {
      ...graphWithoutEdges,
      arguments: graph.arguments.map(({ embedding, graphId, userReaction, ...rest }) => rest)
    };
    const dataStr = JSON.stringify(cleanGraph, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${graph.name || 'graph'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative flex flex-col flex-grow">
      <Link to="/" className={`${buttonStyles.link} h-10 w-10 absolute top-0 left-0`}>
        ←
      </Link>
      <h3 className="m-0 flex-none text-center border-b border-stone-200 py-2">
        {graph?.name || "Loading..."}
        {graph?.isPrivate && <PrivateTag className="ml-2" />}
      </h3>
      {user?.role === 'admin' && (
        <button className={`${buttonStyles.icon.green} h-10 w-10 absolute top-2 right-2`} onClick={handleDownload}>
          <PiDownloadDuotone className={iconClasses}></PiDownloadDuotone>
        </button>
      )}
      <ViewSelector graphId={graphId || ""} currentView={currentView as "feed" | "graph" | "analysis"} />
      {children}
    </div>
  );
};

const GraphLayout = ({ children }: { children: React.ReactNode }) => {
  const { graphId } = useParams<{ graphId: string }>();

  return (
    <GraphProvider graphId={graphId!}>
      <GraphLayoutContent>{children}</GraphLayoutContent>
    </GraphProvider>
  );
};

export default GraphLayout;
