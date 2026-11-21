const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Todo = require("../models/Todo");

// Exercise the real routes and authentication middleware with an isolated model store.
process.env.JWT_SECRET = "account-tests-only-secret";
let account;
let deletedTasks;
let server;
let origin;
const originals = {
  updateOne: User.updateOne,
  findById: User.findById,
  findByIdAndDelete: User.findByIdAndDelete,
  deleteMany: Todo.deleteMany,
};
User.updateOne = async () => {
  account.tokenVersion += 1;
};
User.findById = async (id) => (account && id === account.id ? account : null);
User.findByIdAndDelete = async () => {
  account = null;
};
Todo.deleteMany = async (filter) => {
  deletedTasks = filter.user;
};
function reset() {
  deletedTasks = null;
  account = {
    id: "507f1f77bcf86cd799439011",
    _id: "507f1f77bcf86cd799439011",
    username: "Alex",
    email: "alex@example.com",
    password: "old-password",
    tokenVersion: 0,
    async matchPassword(value) {
      return value === this.password;
    },
    async save() {},
  };
  return jwt.sign({ id: account.id, version: 0 }, process.env.JWT_SECRET);
}
async function request(path, method = "GET", body, token) {
  const response = await fetch(`${origin}/api/auth${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}
before(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", require("../routes/authRoutes"));
  app.use("/api", require("../routes/todoRoutes"));
  server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  User.updateOne = originals.updateOne;
  User.findById = originals.findById;
  User.findByIdAndDelete = originals.findByIdAndDelete;
  Todo.deleteMany = originals.deleteMany;
  await new Promise((resolve) => server.close(resolve));
});
test("profile requires authentication and never returns password", async () => {
  const token = reset();
  assert.equal((await request("/me")).status, 401);
  assert.equal((await request("/me", "GET", null, "invalid")).status, 401);
  const result = await request("/me", "GET", null, token);
  assert.equal(result.status, 200);
  assert.deepEqual(result.data, {
    username: "Alex",
    email: "alex@example.com",
  });
});
test("password change validates input and invalidates old sessions", async () => {
  const token = reset();
  for (const body of [
    { currentPassword: "wrong", newPassword: "new-password" },
    { currentPassword: "old-password", newPassword: "short" },
    { currentPassword: "old-password", newPassword: "old-password" },
    { currentPassword: "old-password", newPassword: "a".repeat(73) },
  ]) {
    assert.equal((await request("/password", "PUT", body, token)).status, 400);
  }
  assert.equal(account.tokenVersion, 0);
  const result = await request(
    "/password",
    "PUT",
    { currentPassword: "old-password", newPassword: "new-password" },
    token,
  );
  assert.equal(result.status, 200);
  assert.equal(account.password, "new-password");
  assert.equal((await request("/me", "GET", null, token)).status, 401);
  assert.equal(
    (await request("/me", "GET", null, result.data.token)).status,
    200,
  );
});
test("account deletion requires password, removes tasks and rejects deleted account tokens", async () => {
  const token = reset();
  const id = account.id;
  assert.equal((await request("/me", "DELETE", {}, token)).status, 400);
  assert.equal(
    (await request("/me", "DELETE", { password: "wrong" }, token)).status,
    400,
  );
  assert.equal(deletedTasks, null);
  assert.equal(
    (await request("/me", "DELETE", { password: "old-password" }, token))
      .status,
    200,
  );
  assert.equal(deletedTasks, id);
  assert.equal(account, null);
  assert.equal((await request("/me", "GET", null, token)).status, 401);
});

test("logout revokes tokens so typed profile URLs cannot restore a session", async () => {
  const token = reset();
  assert.equal((await request("/logout", "POST")).status, 401);
  assert.equal((await request("/logout", "POST", {}, token)).status, 200);
  assert.equal((await request("/me", "GET", null, token)).status, 401);
  assert.equal(
    (
      await request(
        "/password",
        "PUT",
        { currentPassword: "old-password", newPassword: "new-password" },
        token,
      )
    ).status,
    401,
  );
  assert.equal(
    (await request("/me", "DELETE", { password: "old-password" }, token))
      .status,
    401,
  );
});

test("expired and forged sessions cannot access profile or task APIs", async () => {
  reset();
  const expired = jwt.sign(
    { id: account.id, version: 0 },
    process.env.JWT_SECRET,
    { expiresIn: -1 },
  );
  const forged = jwt.sign({ id: account.id, version: 0 }, "wrong-signing-key");
  for (const token of [null, expired, forged]) {
    assert.equal((await request("/me", "GET", null, token)).status, 401);
    const response = await fetch(`${origin}/api/todos`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});
test("login rejects query objects and invalid credential types", async () => {
  for (const body of [
    { email: { $ne: null }, password: "secret" },
    { email: "alex@example.com", password: {} },
    {},
  ]) {
    assert.equal((await request("/login", "POST", body)).status, 400);
  }
});
