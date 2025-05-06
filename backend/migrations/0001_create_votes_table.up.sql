BEGIN;

CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    option_id INTEGER NOT NULL,
    voted_at TIMESTAMP NOT NULL,
    request_id VARCHAR(36) NOT NULL
);

CREATE INDEX idx_votes_option_id ON votes(option_id);
CREATE INDEX idx_votes_voted_at ON votes(voted_at);

COMMIT;