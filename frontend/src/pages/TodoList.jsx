import LoadingStatus from "../components/LoadingStatus";
import { useState, useEffect, useRef, useCallback } from "react";
import api from "../api";
import Header from "../components/Header";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [editText, setEditText] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState({});
  // Store request IDs without causing a second render.
  const locks = useRef(new Set());
  const inputRef = useRef(null);

  const fetchTodos = useCallback(async (signal) => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data } = await api.get("/todos", { signal });
      setTodos(data);
    } catch (error) {
      if (error.code !== "ERR_CANCELED") setLoadError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchTodos(controller.signal);
    return () => controller.abort();
  }, [fetchTodos]);

  async function handleAddTodo(event) {
    event.preventDefault();
    if (!task.trim() || locks.current.has("add")) return;
    locks.current.add("add");
    setAdding(true);
    try {
      const { data } = await api.post("/todos", { task: task.trim() });
      setTodos((current) => [...current, data]);
      setTask("");
      toast.success("Task added");
      inputRef.current?.focus();
    } catch {
      toast.error("Unable to add task. Please try again.");
    } finally {
      locks.current.delete("add");
      setAdding(false);
    }
  }

  // A ref blocks a duplicate click immediately, before React redraws the button.
  function startTaskRequest(id) {
    if (locks.current.has(id)) {
      return false;
    }
    locks.current.add(id);
    setPending((current) => ({ ...current, [id]: true }));
    return true;
  }

  function finishTaskRequest(id) {
    locks.current.delete(id);
    setPending((current) => {
      const updated = { ...current };
      delete updated[id];
      return updated;
    });
  }

  async function handleToggleComplete(todo) {
    if (!startTaskRequest(todo._id)) return;
    try {
      const response = await api.put("/todos/" + todo._id, {
        completed: !todo.completed,
      });
      setTodos((current) =>
        current.map((item) => {
          if (item._id === todo._id) return response.data;
          return item;
        }),
      );
    } catch {
      toast.error("Unable to update task. Please try again.");
    } finally {
      finishTaskRequest(todo._id);
    }
  }

  async function handleSaveTask(event, todo) {
    event.preventDefault();
    if (!editText.trim() || !startTaskRequest(todo._id)) return;
    try {
      const response = await api.put("/todos/" + todo._id, {
        task: editText.trim(),
      });
      setTodos((current) =>
        current.map((item) => {
          if (item._id === todo._id) return response.data;
          return item;
        }),
      );
      cancelEdit();
      toast.success("Task updated");
    } catch {
      toast.error("Unable to update task. Please try again.");
    } finally {
      finishTaskRequest(todo._id);
    }
  }

  async function handleDeleteTodo(todo) {
    if (!startTaskRequest(todo._id)) return;
    try {
      await api.delete("/todos/" + todo._id);
      setTodos((current) => current.filter((item) => item._id !== todo._id));
      if (editingTask === todo._id) cancelEdit();
      toast.success("Task deleted");
    } catch {
      toast.error("Unable to delete task. Please try again.");
    } finally {
      finishTaskRequest(todo._id);
    }
  }

  function cancelEdit() {
    setEditingTask(null);
    setEditText("");
  }
  const completed = todos.filter((todo) => todo.completed).length;

  // Use separate conditions instead of a long chain of nested ternaries.
  function renderTaskList() {
    if (loading) {
      return (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 text-muted">
          <LoadingStatus />
        </div>
      );
    }
    if (loadError) {
      return (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 text-muted">
          <p className="text-control" role="alert">
            Unable to load your tasks.
          </p>
          <button
            className="secondary-button mt-4"
            onClick={() => fetchTodos()}
          >
            Try again
          </button>
        </div>
      );
    }
    if (todos.length === 0) {
      return (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 text-muted">
          <i
            className="bi bi-clipboard-check mb-3 inline-block text-3xl text-blue-300"
            aria-hidden="true"
          />
          <h3 className="mb-1 font-semibold">A fresh start.</h3>
          <p className="text-control">
            Add your first task above. One small step is enough.
          </p>
        </div>
      );
    }
    return (
      <ul
        className="m-0 min-h-0 flex-1 list-none overflow-y-auto overscroll-contain px-3 pb-3 focus-visible:outline-offset-[-3px]"
        tabIndex={0}
        aria-label="Your tasks"
      >
        {todos.map((todo) => (
          <li
            key={todo._id}
            className={
              "flex flex-wrap items-center gap-1.5 rounded-md border-b border-line px-2 py-4 sm:flex-nowrap sm:gap-3 sm:px-3 last:border-transparent hover:bg-blue-50/40" +
              (editingTask === todo._id ? " bg-blue-50/40 items-start" : "") +
              (todo.completed ? " bg-slate-50/50" : "")
            }
            aria-busy={Boolean(pending[todo._id])}
          >
            <button
              type="button"
              className={
                "grid h-8 w-8 shrink-0 place-items-center rounded-control hover:bg-blue-50 hover:text-primary text-xl" +
                (todo.completed ? " text-emerald-600" : " text-muted")
              }
              disabled={pending[todo._id] || editingTask === todo._id}
              aria-label={
                todo.completed ? "Mark task incomplete" : "Mark task complete"
              }
              aria-pressed={todo.completed}
              onClick={() => handleToggleComplete(todo)}
            >
              <i
                className={`bi bi-${todo.completed ? "check2-circle" : "circle"}`}
                aria-hidden="true"
              />
            </button>
            {editingTask === todo._id ? (
              <form
                className="min-w-0 flex-1"
                onSubmit={(event) => handleSaveTask(event, todo)}
              >
                <label className="sr-only" htmlFor={`edit-${todo._id}`}>
                  Edit task
                </label>
                <input
                  className="input-field bg-surface"
                  autoFocus
                  id={`edit-${todo._id}`}
                  value={editText}
                  onChange={(event) => setEditText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape" && !pending[todo._id])
                      cancelEdit();
                  }}
                  maxLength={500}
                  required
                  disabled={pending[todo._id]}
                />
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <button
                    className="button bg-blue-50 text-primary"
                    disabled={pending[todo._id] || !editText.trim()}
                  >
                    {pending[todo._id] ? <LoadingStatus /> : "Save changes"}
                  </button>
                  <button
                    type="button"
                    className="button bg-slate-100 text-muted"
                    onClick={cancelEdit}
                    disabled={pending[todo._id]}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <span
                className={
                  "min-w-0 flex-1 break-words text-body text-content" +
                  (todo.completed ? " text-muted line-through" : "")
                }
              >
                {todo.task}
              </span>
            )}
            {pending[todo._id] && editingTask !== todo._id && (
              <span className="text-xs text-muted w-full shrink-0 pl-9 sm:w-auto sm:pl-0">
                <LoadingStatus />
              </span>
            )}
            <div className="flex shrink-0 items-center gap-1">
              {editingTask !== todo._id && (
                <button
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-control text-muted hover:bg-blue-50 hover:text-primary text-control"
                  type="button"
                  aria-label={`Edit task: ${todo.task}`}
                  title="Edit task"
                  disabled={pending[todo._id] || Boolean(editingTask)}
                  onClick={() => {
                    setEditingTask(todo._id);
                    setEditText(todo.task);
                  }}
                >
                  <i className="bi bi-pencil" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-control text-muted text-control hover:bg-rose-50 hover:text-rose-600"
                aria-label={`Delete task: ${todo.task}`}
                title="Delete task"
                disabled={pending[todo._id]}
                onClick={() => handleDeleteTodo(todo)}
              >
                <i className="bi bi-trash3" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="bg-slate-50 flex h-dvh min-h-0 flex-col overflow-hidden">
      <Header />
      <main className="mx-auto w-full min-h-0 flex-1 px-5 pt-3 md:px-6 md:pt-6 flex max-w-workspace flex-col overflow-hidden pb-4">
        <section
          className="rounded-md border border-line bg-surface shadow-sm flex min-h-0 flex-1 flex-col overflow-hidden"
          aria-label="Task manager"
        >
          <form
            onSubmit={handleAddTodo}
            className="shrink-0 border-b border-line bg-slate-50/50 p-4 md:p-6"
          >
            <label
              className="mb-2 block text-control font-semibold text-muted"
              htmlFor="new-task"
            >
              What would you like to get done?
            </label>
            <div className="flex items-stretch gap-2 sm:gap-3">
              <div className="min-w-0 flex-1">
                <input
                  className="input-field bg-surface"
                  id="new-task"
                  ref={inputRef}
                  value={task}
                  onChange={(event) => setTask(event.target.value)}
                  placeholder="Write a task and press Enter"
                  required
                  maxLength={500}
                  disabled={adding || loading || loadError}
                />
              </div>
              <button
                className="primary-button shrink-0 shadow-none"
                disabled={adding || loading || loadError || !task.trim()}
                aria-busy={adding}
              >
                {adding ? <LoadingStatus /> : "Add task"}
              </button>
            </div>
          </form>
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-4 md:px-6">
            <h2 className="flex items-center gap-2 text-body">
              My tasks{" "}
              <span className="text-xs text-muted rounded bg-slate-100 px-2 py-0.5">
                {todos.length}
              </span>
            </h2>
            {!loading && !loadError && (
              <p className="text-xs text-muted">
                {completed} of {todos.length} completed
              </p>
            )}
          </div>
          {renderTaskList()}
        </section>
        <ToastContainer
          toastClassName="rounded-md"
          position="top-right"
          autoClose={2000}
          hideProgressBar
          icon={({ type }) => (
            <i
              className={`bi bi-${type === "error" ? "exclamation-circle" : "check-circle"}`}
              aria-hidden="true"
            />
          )}
          closeButton={({ closeToast }) => (
            <button
              type="button"
              onClick={closeToast}
              aria-label="Dismiss notification"
            >
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          )}
        />
      </main>
    </div>
  );
}
