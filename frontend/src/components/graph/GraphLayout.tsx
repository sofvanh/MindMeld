import React from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { buttonStyles } from "../../styles/defaultStyles";
import ViewSelector from "../ViewSelector";
import { GraphProvider, useGraphContext } from "../../contexts/GraphContext";

const GraphLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { graphId } = useParams<{ graphId: string }>();
  const { graph } = useGraphContext();
  const location = useLocation();
  const currentView = location.pathname.startsWith("/feed/") ? "feed" : "graph";

  return (
    <div className="relative flex flex-col flex-grow">
      <Link to="/" className={`${buttonStyles.link} h-10 w-10 absolute top-0 left-0`}>
        ←
      </Link>
      <h3 className="m-0 flex-none text-center border-b border-stone-200 py-2">{graph?.name || "Loading..."}</h3>
      <ViewSelector graphId={graphId || ""} currentView={currentView} />
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
