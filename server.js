// SQLite server Express + REST API untuk to-do list.
const path = require("path");
const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const { createStore } = require("./store");

const app = express();

// Render
const PORT = process.env.PORT || 3000;

// Lokasi database
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "todos.db");

const db = new DatabaseSync(DB_PATH);
const store = createStore(db);

// ---------- Middleware ----------
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------- Fungsi bantu ----------
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateTitle(title) {
  if (typeof title !== "string") return "Judul harus berupa teks.";
  const trimmed = title.trim();
  if (trimmed.length === 0) return "Judul tidak boleh kosong.";
  if (trimmed.length > 200) return "Judul maksimal 200 karakter.";
  return null; // null = valid
}

// ---------- Route API ----------

// GET /api/todos  -> daftar semua to-do
app.get("/api/todos", (req, res) => {
  res.json(store.list());
});

// POST /api/todos  -> buat to-do baru
app.post("/api/todos", (req, res) => {
  const { title } = req.body || {};
  const error = validateTitle(title);
  if (error) return res.status(400).json({ error });

  const todo = store.create(title.trim());
  res.status(201).json(todo);
});

// PUT /api/todos/:id  -> ubah judul dan/atau status selesai
app.put("/api/todos/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID tidak valid." });

  const { title, done } = req.body || {};
  const changes = {};

  if (title !== undefined) {
    const error = validateTitle(title);
    if (error) return res.status(400).json({ error });
    changes.title = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== "boolean") {
      return res.status(400).json({ error: "Field done harus true atau false." });
    }
    changes.done = done;
  }

  const todo = store.update(id, changes);
  if (!todo) return res.status(404).json({ error: "To-do tidak ditemukan." });
  res.json(todo);
});

// DELETE /api/todos/:id  -> hapus to-do
app.delete("/api/todos/:id", (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "ID tidak valid." });

  const removed = store.remove(id);
  if (!removed) return res.status(404).json({ error: "To-do tidak ditemukan." });
  res.status(204).end();
});

// Endpoint untuk cek server hidup
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ---------- Server ----------
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
