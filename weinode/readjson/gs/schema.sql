
DROP TABLE IF EXISTS intent_intent_call;
DROP TABLE IF EXISTS intent_batch_run;

CREATE TABLE intent_batch_run (
  batch_run_id INTEGER PRIMARY KEY,
  start_timestamp INTEGER,
  stop_timestamp INTEGER DEFAULT 0,  
  searchCount INTEGER
);

CREATE TABLE intent_intent_call (
  intent_call_id INTEGER PRIMARY KEY,
  batch_run_id INTEGER NOT NULL,  
  result TEXT DEFAULT '',  
  FOREIGN KEY (batch_run_id) REFERENCES intent_batch_run(batch_run_id) ON DELETE CASCADE
);

