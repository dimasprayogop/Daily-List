const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const message = document.getElementById("message");
const summary = document.getElementById("summary");

// ---------- Bantu otomatis kirim JSON dan lempar error ----------
async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Terjadi kesalahan pada server.");
  }

  return res.status === 204 ? null : res.json();
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

// ---------- Tampilan ----------
function renderTodos(todos) {
  list.innerHTML = "";

  if (todos.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Belum ada tugas. Tambahkan yang pertama!";
    list.appendChild(empty);
    summary.textContent = "";
    return;
  }

  for (const todo of todos) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " done" : "");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.setAttribute("aria-label", "Tandai selesai");
    checkbox.addEventListener("change", () => updateTodo(todo.id, { done: checkbox.checked }));

    // Judul
    const title = document.createElement("span");
    title.className = "todo-title";
    title.textContent = todo.title;

    // Ubah judul
    const editBtn = document.createElement("button");
    editBtn.className = "secondary";
    editBtn.textContent = "Ubah";
    editBtn.addEventListener("click", () => {
      const newTitle = prompt("Ubah tugas:", todo.title);
      if (newTitle !== null && newTitle.trim() !== "") {
        updateTodo(todo.id, { title: newTitle });
      }
    });

    // Hapus
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "danger";
    deleteBtn.textContent = "Hapus";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, title, editBtn, deleteBtn);
    list.appendChild(li);
  }

  const remaining = todos.filter((t) => !t.done).length;
  summary.textContent = `${remaining} belum selesai dari ${todos.length} tugas`;
}

// ---------- CRUD ----------
async function loadTodos() {
  try {
    showMessage("Memuat... (kalau server baru bangun, bisa sampai 1 menit)");
    const todos = await api("/api/todos");
    renderTodos(todos);
    showMessage("");
  } catch (err) {
    showMessage(err.message, true);
  }
}

async function addTodo(title) {
  try {
    await api("/api/todos", { method: "POST", body: JSON.stringify({ title }) });
    showMessage("");
    await loadTodos();
  } catch (err) {
    showMessage(err.message, true);
  }
}

async function updateTodo(id, changes) {
  try {
    await api(`/api/todos/${id}`, { method: "PUT", body: JSON.stringify(changes) });
    showMessage("");
    await loadTodos();
  } catch (err) {
    showMessage(err.message, true);
  }
}

async function deleteTodo(id) {
  if (!confirm("Hapus tugas ini?")) return;
  try {
    await api(`/api/todos/${id}`, { method: "DELETE" });
    showMessage("");
    await loadTodos();
  } catch (err) {
    showMessage(err.message, true);
  }
}

// ---------- Event ----------
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // cegah halaman reload
  const title = input.value.trim();
  if (!title) return;

  await addTodo(title);
  input.value = "";
  input.focus();
});

// Muat data saat halaman pertama dibuka
loadTodos();
