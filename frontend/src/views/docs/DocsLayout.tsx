import Layout from "../../components/Layout";
import DocsDocNavigation from "./DocsDocNavigation";

const DocsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout>
      <DocsDocNavigation>
        {children}
      </DocsDocNavigation>
    </Layout>
  );
};

export default DocsLayout;
