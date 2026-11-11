function createStore(db) {
  // Tabel
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL,
      done       INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now', '+7 hours'))
    )
  `);

  // Prepared statement dari SQL injection
  const listStmt = db.prepare("SELECT * FROM todos ORDER BY id DESC");
  const getStmt = db.prepare("SELECT * FROM todos WHERE id = ?");
  const insertStmt = db.prepare("INSERT INTO todos (title) VALUES (?)");
  const updateStmt = db.prepare("UPDATE todos SET title = ?, done = ? WHERE id = ?");
  const deleteStmt = db.prepare("DELETE FROM todos WHERE id = ?");

  // Ubah baris database
  function toTodo(row) {
    if (!row) return null;
    return {
      id: Number(row.id),
      title: row.title,
      done: row.done === 1,
      createdAt: row.created_at,
    };
  }

  return {
    // READ (semua)
    list() {
      return listStmt.all().map(toTodo);
    },

    // READ (satu)
    get(id) {
      return toTodo(getStmt.get(id));
    },

    // CREATE
    create(title) {
      const info = insertStmt.run(title);
      return toTodo(getStmt.get(info.lastInsertRowid));
    },

    // UPDATE
    update(id, { title, done }) {
      const current = getStmt.get(id);
      if (!current) return null;

      const newTitle = title !== undefined ? title : current.title;
      const newDone = done !== undefined ? (done ? 1 : 0) : current.done;

      updateStmt.run(newTitle, newDone, id);
      return toTodo(getStmt.get(id));
    },

    // DELETE
    remove(id) {
      return deleteStmt.run(id).changes > 0;
    },
  };
}

module.exports = { createStore };
