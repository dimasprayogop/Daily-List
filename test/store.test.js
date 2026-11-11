const assert = require("node:assert/strict");
const { DatabaseSync } = require("node:sqlite");
const { createStore } = require("../store");

const store = createStore(new DatabaseSync(":memory:"));

// Awal kosong
assert.deepEqual(store.list(), []);

// CREATE
const a = store.create("Belajar Express");
const b = store.create("Belajar SQLite");
assert.equal(a.title, "Belajar Express");
assert.equal(a.done, false);
assert.equal(typeof a.id, "number");
assert.ok(b.id > a.id);

// READ — urutan terbaru di atas
const all = store.list();
assert.equal(all.length, 2);
assert.equal(all[0].title, "Belajar SQLite");

// READ satu
assert.equal(store.get(a.id).title, "Belajar Express");
assert.equal(store.get(9999), null);

// UPDATE status
const doneA = store.update(a.id, { done: true });
assert.equal(doneA.done, true);
assert.equal(doneA.title, "Belajar Express");

// UPDATE judul
const renamed = store.update(a.id, { title: "Belajar Express.js" });
assert.equal(renamed.title, "Belajar Express.js");
assert.equal(renamed.done, true);

// UPDATE balik ke belum selesai
assert.equal(store.update(a.id, { done: false }).done, false);

// UPDATE id yang tidak ada
assert.equal(store.update(9999, { done: true }), null);

// SQL
const evil = store.create("x'); DROP TABLE todos; --");
assert.equal(evil.title, "x'); DROP TABLE todos; --");
assert.equal(store.list().length, 3);

// DELETE
assert.equal(store.remove(a.id), true);
assert.equal(store.remove(a.id), false);
assert.equal(store.list().length, 2);

console.log("Semua tes store lulus");
