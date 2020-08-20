DROP TABLE IF EXISTS locations;

CREATE TABLE locations(
    id SERIAL PRIMARY KEY,
  latitude VARCHAR(255),
  longitude VARCHAR(255),
  formatted_query VARCHAR(255),
  search_query VARCHAR(255)
);

INSERT INTO locations (latitude, longitude, formatted_query, search_query) VALUES ('47.602085', '-122.334161', 'Seattle, WA, U.S.A.', 'seattle');