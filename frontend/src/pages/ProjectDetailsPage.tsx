import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

type Task = {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  due_date?: string;
};

type Project = {
  id: string;
  title: string;
  description?: string;
  status: "active" | "completed";
};

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">("todo");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectRes, taskRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/tasks/project/${projectId}`, {
          params: filter ? { status: filter } : {},
        }),
      ]);

      setProject(projectRes.data);
      setTasks(taskRes.data || []);
    } catch {
      setError("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, filter]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post(`/tasks/project/${projectId}`, {
        title: title.trim(),
        description: description.trim(),
        status,
        due_date: dueDate || null,
      });

      setTitle("");
      setDescription("");
      setStatus("todo");
      setDueDate("");
      fetchData();
    } catch {
      setError("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (
    taskId: string,
    newStatus: "todo" | "in-progress" | "done"
  ) => {
    try {
      setUpdatingTaskId(taskId);
      await api.put(`/tasks/${taskId}`, { status: newStatus });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch {
      setError("Failed to update task status");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    try {
      setDeletingTaskId(taskId);
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch {
      setError("Failed to delete task");
    } finally {
      setDeletingTaskId(null);
    }
  };

  const taskStats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      inProgress: tasks.filter((task) => task.status === "in-progress").length,
      done: tasks.filter((task) => task.status === "done").length,
    };
  }, [tasks]);

  const formatDueDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const getTaskBadge = (taskStatus: Task["status"]) => {
    if (taskStatus === "done") {
      return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    }
    if (taskStatus === "in-progress") {
      return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
    }
    return "bg-slate-700 text-slate-200 border border-slate-600";
  };

  const getProjectBadge = (projectStatus: Project["status"]) => {
    return projectStatus === "active"
      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
      : "bg-slate-700 text-slate-200 border border-slate-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-7xl mx-auto">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="text-blue-400 hover:text-blue-300 inline-block mb-6">
            ← Back to Dashboard
          </Link>
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-red-200">
            Project not found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link to="/" className="text-blue-400 hover:text-blue-300 inline-block mb-6">
          ← Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <p className="text-slate-400 mt-2 max-w-3xl">
                {project.description || "No project description provided."}
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300 border border-slate-700">
                  Total Tasks: {taskStats.total}
                </span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300 border border-slate-700">
                  Todo: {taskStats.todo}
                </span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300 border border-slate-700">
                  In Progress: {taskStats.inProgress}
                </span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300 border border-slate-700">
                  Done: {taskStats.done}
                </span>
              </div>
            </div>

            <span className={`text-sm px-3 py-1 rounded-full ${getProjectBadge(project.status)}`}>
              {project.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/15 border border-red-400/30 px-4 py-3 text-red-200">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-5">Add Task</h2>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Task Title</label>
                  <input
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="Enter task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Description</label>
                  <textarea
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 min-h-[110px]"
                    placeholder="Enter task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Status</label>
                  <select
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "todo" | "in-progress" | "done")}
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 font-semibold transition disabled:opacity-70"
                >
                  {submitting ? "Adding Task..." : "Add Task"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <h2 className="text-2xl font-semibold">Tasks</h2>

              <select
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 outline-none"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All Tasks</option>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center text-slate-400">
                No tasks found for this project.
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <h3 className="text-lg font-semibold">{task.title}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full ${getTaskBadge(task.status)}`}>
                            {task.status}
                          </span>
                        </div>

                        <p className="text-slate-400 mt-2">
                          {task.description || "No task description provided."}
                        </p>

                        {task.due_date && (
                          <p className="text-sm text-slate-500 mt-4">
                            Due: {formatDueDate(task.due_date)}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleUpdateTaskStatus(
                              task.id,
                              e.target.value as "todo" | "in-progress" | "done"
                            )
                          }
                          disabled={updatingTaskId === task.id}
                          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 outline-none"
                        >
                          <option value="todo">Todo</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={deletingTaskId === task.id}
                          className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 font-medium disabled:opacity-70"
                        >
                          {deletingTaskId === task.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    {updatingTaskId === task.id && (
                      <p className="text-sm text-slate-500 mt-3">Updating status...</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}