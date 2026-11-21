const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const connectDatabase = require("../database");

const originalConnect = mongoose.connect;
const originalUri = process.env.MONGO_URI;
let calls = 0;
let finishConnection;

mongoose.connect = () => {
  calls += 1;
  mongoose.connection.readyState = 2;
  return new Promise((resolve) => {
    finishConnection = resolve;
  });
};

after(() => {
  mongoose.connect = originalConnect;
  mongoose.connection.readyState = 0;
  if (originalUri === undefined) delete process.env.MONGO_URI;
  else process.env.MONGO_URI = originalUri;
});

test("database connections are shared and reused between warm requests", async () => {
  process.env.MONGO_URI = "mongodb://example.test/taskmate";
  const first = connectDatabase();
  const second = connectDatabase();
  assert.equal(calls, 1);
  mongoose.connection.readyState = 1;
  finishConnection(mongoose);
  await Promise.all([first, second]);
  await connectDatabase();
  assert.equal(calls, 1);
});

test("a dropped connection starts a new attempt", async () => {
  mongoose.connection.readyState = 0;
  const attempt = connectDatabase();
  assert.equal(calls, 2);
  mongoose.connection.readyState = 1;
  finishConnection(mongoose);
  await attempt;
});

test("missing MongoDB configuration returns an error", async () => {
  mongoose.connection.readyState = 0;
  delete process.env.MONGO_URI;
  await assert.rejects(connectDatabase(), /MONGO_URI is missing/);
});
