CREATE TABLE users (
    id VARCHAR(20) PRIMARY KEY,
    google_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE graphs (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    author_id VARCHAR(20),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE arguments (
    id VARCHAR(20) PRIMARY KEY,
    graph_id VARCHAR(20) NOT NULL,
    statement TEXT NOT NULL,
    embedding DOUBLE PRECISION[] NOT NULL,
    author_id VARCHAR(20),
    FOREIGN KEY (graph_id) REFERENCES graphs(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
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

CREATE TABLE reactions (
    id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    argument_id VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (argument_id) REFERENCES arguments(id),
    UNIQUE (user_id, argument_id, type)
);

CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_reactions_argument_id ON reactions(argument_id);

CREATE TABLE private_graphs (
    graph_id VARCHAR(20) PRIMARY KEY,
    whitelisted_emails TEXT[] NOT NULL,
    FOREIGN KEY (graph_id) REFERENCES graphs(id) ON DELETE CASCADE
);

CREATE INDEX idx_private_graphs_graph_id ON private_graphs(graph_id);
