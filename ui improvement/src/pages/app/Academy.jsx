import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Star, Search, GitBranch, List, Loader2 } from "lucide-react";
import PillBadge from "@/components/ui/PillBadge";
import ModuleModal from "@/components/academy/ModuleModal";
import KnowledgeTree from "@/components/academy/KnowledgeTree";
import { api } from "@/lib/api";
import { difficultyColor, formatModuleViews, normalizeModule } from "@/lib/academy";

function ModuleCard({ mod, onOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-navy/20 transition-all cursor-pointer group"
      onClick={() => onOpen(mod)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <PillBadge variant={difficultyColor[mod.difficulty]}>{mod.difficulty}</PillBadge>
          <span className="text-xs text-muted-foreground">{mod.category}</span>
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onToggle(mod);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
          title={mod.completed ? "Mark incomplete" : "Mark complete"}
        >
          <CheckCircle
            className={`w-5 h-5 ${
              mod.completed ? "text-emerald-500 fill-emerald-500" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      {mod.completed && (
        <div className="flex items-center gap-1 mb-2">
          <CheckCircle className="w-3 h-3 text-emerald-500 fill-emerald-500" />
          <span className="text-xs text-emerald-600 font-medium">Completed</span>
        </div>
      )}

      <h3 className="font-semibold text-foreground mb-2 text-sm leading-snug">{mod.name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{mod.intro}</p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatModuleViews(mod.views)} views
        </span>
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-gold text-gold" />
          {mod.ratings.toFixed(1)}
        </span>
      </div>
    </motion.div>
  );
}

export default function Academy() {
  const [modules, setModules] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState("All");
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("modules");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadModules() {
      try {
        setLoading(true);
        setError("");
        const response = await api.getAcademy();

        if (!cancelled) {
          setModules(response.map(normalizeModule));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load the Academy.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadModules();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      modules.filter((module) => {
        const matchSearch =
          module.name.toLowerCase().includes(search.toLowerCase()) ||
          module.category.toLowerCase().includes(search.toLowerCase());
        const matchDiff = filterDiff === "All" || module.difficulty === filterDiff;
        return matchSearch && matchDiff;
      }),
    [filterDiff, modules, search]
  );

  const updateModuleInState = (updatedModule) => {
    const normalized = normalizeModule(updatedModule);

    setModules((prev) =>
      prev.map((module) =>
        module.module_id === normalized.module_id ? { ...module, ...normalized } : module
      )
    );

    setSelected((prev) =>
      prev && prev.module_id === normalized.module_id ? { ...prev, ...normalized } : prev
    );
  };

  const toggleComplete = async (mod) => {
    const nextStatus = !mod.completed;

    setModules((prev) =>
      prev.map((module) =>
        module.module_id === mod.module_id ? { ...module, completed: nextStatus } : module
      )
    );

    try {
      await api.setModuleComplete(mod.module_id, nextStatus);
      setSelected((prev) =>
        prev && prev.module_id === mod.module_id ? { ...prev, completed: nextStatus } : prev
      );
      return nextStatus;
    } catch (err) {
      setModules((prev) =>
        prev.map((module) =>
          module.module_id === mod.module_id ? { ...module, completed: mod.completed } : module
        )
      );
      throw err;
    }
  };

  const completed = modules.filter((module) => module.completed).length;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p className="text-sm">Loading Academy modules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-3xl text-foreground mb-3">Academy unavailable</h1>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-5 border-b border-border bg-background">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-serif text-3xl text-foreground mb-1">Knowledge Academy</h1>
            <p className="text-sm text-muted-foreground">
              {completed} of {modules.length} modules completed
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-28 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-navy rounded-full transition-all"
                style={{ width: `${modules.length > 0 ? (completed / modules.length) * 100 : 0}%` }}
              />
            </div>

            <div className="flex gap-1 border border-border rounded-lg p-1">
              <button
                onClick={() => setView("modules")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  view === "modules" ? "bg-navy text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-3.5 h-3.5" /> Modules
              </button>
              <button
                onClick={() => setView("tree")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  view === "tree" ? "bg-navy text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" /> Knowledge Tree
              </button>
            </div>
          </div>
        </div>

        {view === "modules" && (
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search modules..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
              />
            </div>

            <div className="flex gap-1.5">
              {["All", "Beginner", "Intermediate", "Advanced"].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setFilterDiff(difficulty)}
                  className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                    filterDiff === difficulty
                      ? "bg-navy text-white"
                      : "border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === "modules" ? (
          <div className="p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((module) => (
                <ModuleCard
                  key={module.module_id}
                  mod={module}
                  onOpen={setSelected}
                  onToggle={toggleComplete}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground text-sm">
                No modules found for "{search}"
              </div>
            )}
          </div>
        ) : (
          <KnowledgeTree modules={modules} onToggleComplete={toggleComplete} />
        )}
      </div>

      {selected && (
        <ModuleModal
          mod={selected}
          onClose={() => setSelected(null)}
          onToggleComplete={toggleComplete}
          onModuleChange={updateModuleInState}
        />
      )}
    </div>
  );
}
