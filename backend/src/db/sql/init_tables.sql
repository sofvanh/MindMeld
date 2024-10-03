CREATE TABLE graphs (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE arguments (
    id VARCHAR(20) PRIMARY KEY,
    graph_id VARCHAR(20) NOT NULL,
    statement TEXT NOT NULL,
    embedding DOUBLE PRECISION[] NOT NULL,
    FOREIGN KEY (graph_id) REFERENCES graphs(id)
);

CREATE INDEX idx_arguments_graph_id ON arguments(graph_id);

CREATE TABLE edges (
    id VARCHAR(20) PRIMARY KEY,
    graph_id VARCHAR(20) NOT NULL,
    source_id VARCHAR(20) NOT NULL,
    target_id VARCHAR(20) NOT NULL,
    FOREIGN KEY (graph_id) REFERENCES graphs(id),
    FOREIGN KEY (source_id) REFERENCES arguments(id),
    FOREIGN KEY (target_id) REFERENCES arguments(id)
);

CREATE INDEX idx_edges_graph_id ON edges(graph_id);
CREATE INDEX idx_edges_source_id ON edges(source_id);
CREATE INDEX idx_edges_target_id ON edges(target_id);