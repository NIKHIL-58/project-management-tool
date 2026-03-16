import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

type Project = {
  id: string;
  title: string;
  description?: string;
  status: "active" | "completed";
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.items || []);
    } catch {
      setError("Failed to load projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    try {
      setLoading(true);
      await api.post("/projects", {
        title: title.trim(),
        description: description.trim(),
        status: "active",
      });
      setTitle("");
      setDescription("");
      fetchProjects();
    } catch {
      setError("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this project?");
    if (!confirmed) return;

    try {
      setDeletingId(projectId);
      await api.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch {
      setError("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Project Dashboard</h1>
            <p className="text-slate-400 text-sm">Manage your projects and tasks</p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/15 border border-red-400/30 px-4 py-3 text-red-200">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-5">Create Project</h2>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Project Title</label>
                  <input
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="Enter project title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Description</label>
                  <textarea
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 min-h-[120px]"
                    placeholder="Enter project description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 transition py-3 font-semibold disabled:opacity-70"
                >
                  {loading ? "Creating..." : "Add Project"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold">Your Projects</h2>
              <span className="text-slate-400 text-sm">{projects.length} total</span>
            </div>

            {projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center text-slate-400">
                No projects yet. Create your first project.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg hover:border-blue-500 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          project.status === "active"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-700 text-slate-200 border border-slate-600"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <p className="text-slate-400 mt-3 line-clamp-3">
                      {project.description || "No description provided."}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                      >
                        View Details →
                      </Link>

                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        disabled={deletingId === project.id}
                        className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-2 text-sm font-medium disabled:opacity-70"
                      >
                        {deletingId === project.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}