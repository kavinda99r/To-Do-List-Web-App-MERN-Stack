const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

// Exercise the exported Vercel app without contacting a real database.
process.env.NODE_ENV = "production";
process.env.FRONTEND_URL = "https://taskmate.example,https://preview.example/";
process.env.JWT_SECRET = "deployment-test-secret";
let databaseUnavailable = false;
const databasePath = require.resolve("../database");
require.cache[databasePath] = {
  id: databasePath,
  filename: databasePath,
  loaded: true,
  exports: async () => {
    if (databaseUnavailable) throw new Error("Test database unavailable");
  },
};

const app = require("../server");
let server;
let origin;

before(async () => {
  server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("the exported Express app responds to health checks", async () => {
  const response = await fetch(`${origin}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-powered-by"), null);
});

test("production allows only configured frontend origins and handles preflight", async () => {
  for (const frontend of [
    "https://taskmate.example",
    "https://preview.example",
  ]) {
    const response = await fetch(`${origin}/api/health`, {
      method: "OPTIONS",
      headers: {
        Origin: frontend,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "authorization",
      },
    });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), frontend);
    assert.match(
      response.headers.get("access-control-allow-headers"),
      /authorization/i,
    );
  }
  const blocked = await fetch(`${origin}/api/health`, {
    headers: { Origin: "https://taskmate.example.evil.test" },
  });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.headers.get("access-control-allow-origin"), null);
});

test("database outages return a retryable JSON response", async () => {
  databaseUnavailable = true;
  try {
    const response = await fetch(`${origin}/api/health`);
    assert.equal(response.status, 503);
    assert.equal(
      (await response.json()).message,
      "Database is unavailable. Please try again.",
    );
  } finally {
    databaseUnavailable = false;
  }
});

test("missing JWT configuration fails closed", async () => {
  const secret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  try {
    assert.equal((await fetch(`${origin}/api/health`)).status, 503);
  } finally {
    process.env.JWT_SECRET = secret;
  }
});

test("unknown routes and malformed JSON return JSON errors", async () => {
  assert.equal((await fetch(`${origin}/api/not-found`)).status, 404);
  const response = await fetch(`${origin}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{invalid-json",
  });
  assert.equal(response.status, 400);
  assert.match(response.headers.get("content-type"), /application\/json/);
});
