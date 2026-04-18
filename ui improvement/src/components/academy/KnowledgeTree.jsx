import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Circle, Plus, X, GitBranch } from "lucide-react";
import PillBadge from "@/components/ui/PillBadge";
import { academyCategoryOrder, difficultyColor } from "@/lib/academy";

function TreeNode({ node, onToggle, onDelete, isCustom }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
      <div
        className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer group ${
          node.completed
            ? "bg-emerald-50 border-emerald-200"
            : isCustom
              ? "bg-amber-50/60 border-amber-200 border-dashed"
              : "bg-card border-border hover:border-navy/30 hover:shadow-sm"
        }`}
        onClick={() => onToggle && onToggle(node)}
      >
        {node.completed ? (
          <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500 flex-shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${node.completed ? "text-emerald-800" : "text-foreground"}`}>
            {node.name}
          </p>
          {node.difficulty && (
            <div className="mt-1">
              <PillBadge variant={difficultyColor[node.difficulty]}>{node.difficulty}</PillBadge>
            </div>
          )}
          {isCustom && <span className="text-xs text-amber-600 font-medium">Custom</span>}
        </div>

        {isCustom && onDelete && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete(node.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-lg"
          >
            <X className="w-3.5 h-3.5 text-red-500" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function AddNodeButton({ onAdd }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const submit = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
      setAdding(false);
    }
  };

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:border-navy/40 hover:text-foreground transition-all w-full"
      >
        <Plus className="w-3.5 h-3.5" /> Add custom topic
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") submit();
          if (event.key === "Escape") setAdding(false);
        }}
        placeholder="Topic name..."
        className="flex-1 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-navy/20"
      />
      <button onClick={submit} className="px-3 py-2 bg-navy text-white rounded-xl text-xs font-medium">Add</button>
      <button onClick={() => setAdding(false)} className="px-2 py-2 border border-border rounded-xl text-xs text-muted-foreground hover:bg-muted">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function CategoryBranch({ category, nodes, customNodes, onToggle, onAddCustom, onDeleteCustom }) {
  const completed = nodes.filter((node) => node.completed).length + customNodes.filter((node) => node.completed).length;
  const total = nodes.length + customNodes.length;
  const allDone = total > 0 && completed === total;

  return (
    <div className="relative">
      <div className={`flex items-center gap-3 mb-3 pb-2 border-b ${allDone ? "border-emerald-200" : "border-border"}`}>
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${allDone ? "bg-emerald-500" : completed > 0 ? "bg-gold" : "bg-muted-foreground/30"}`} />
        <h3 className="font-semibold text-foreground text-sm">{category}</h3>
        <span className="ml-auto text-xs text-muted-foreground">{completed}/{total}</span>
      </div>

      <div className="space-y-2 mb-3">
        {nodes.map((node, index) => (
          <div key={node.module_id} className="flex items-stretch gap-2">
            <div className="flex flex-col items-center w-4 flex-shrink-0">
              <div className="w-px bg-border flex-1 mt-1" />
              {index === nodes.length - 1 && customNodes.length === 0 && <div className="w-0" />}
            </div>
            <div className="flex-1">
              <TreeNode node={node} onToggle={onToggle} isCustom={false} />
            </div>
          </div>
        ))}

        {customNodes.map((node) => (
          <div key={node.id} className="flex items-stretch gap-2">
            <div className="flex flex-col items-center w-4 flex-shrink-0">
              <div className="w-px bg-border flex-1 mt-1" />
            </div>
            <div className="flex-1">
              <TreeNode
                node={node}
                onToggle={() => onToggle(node, true)}
                onDelete={onDeleteCustom}
                isCustom
              />
            </div>
          </div>
        ))}
      </div>

      <div className="ml-6">
        <AddNodeButton onAdd={(name) => onAddCustom(category, name)} />
      </div>
    </div>
  );
}

export default function KnowledgeTree({ modules, onToggleComplete }) {
  const [customNodes, setCustomNodes] = useState({});

  const addCustomNode = (category, name) => {
    setCustomNodes((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), { id: Date.now(), name, completed: false, category }],
    }));
  };

  const deleteCustomNode = (category, id) => {
    setCustomNodes((prev) => ({
      ...prev,
      [category]: (prev[category] || []).filter((node) => node.id !== id),
    }));
  };

  const toggleCustom = (category, node) => {
    setCustomNodes((prev) => ({
      ...prev,
      [category]: (prev[category] || []).map((entry) =>
        entry.id === node.id ? { ...entry, completed: !entry.completed } : entry
      ),
    }));
  };

  const uncategorized = [...new Set(modules.map((module) => module.category))].filter(
    (category) => !academyCategoryOrder.includes(category)
  );
  const allCategories = [...academyCategoryOrder, ...uncategorized];

  const totalCompleted =
    modules.filter((module) => module.completed).length +
    Object.values(customNodes).flat().filter((node) => node.completed).length;
  const totalAll = modules.length + Object.values(customNodes).flat().length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-2xl text-foreground mb-1">Knowledge Tree</h2>
          <p className="text-sm text-muted-foreground">Track your learning path. Add your own custom topics.</p>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gold" /> In progress</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" /> Not started</div>
          <div className="flex items-center gap-1.5 border border-amber-200 px-2 py-1 rounded-lg bg-amber-50">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Custom
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Overall Progress</span>
          <span className="text-sm font-semibold text-foreground">{totalCompleted} / {totalAll}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-navy rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalAll > 0 ? (totalCompleted / totalAll) * 100 : 0}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0}% complete 路 Click any node to toggle completion
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {allCategories.map((category) => {
          const categoryModules = modules.filter((module) => module.category === category);
          if (categoryModules.length === 0 && !(customNodes[category]?.length > 0)) {
            return null;
          }

          return (
            <div key={category} className="bg-card border border-border rounded-2xl p-5">
              <CategoryBranch
                category={category}
                nodes={categoryModules}
                customNodes={customNodes[category] || []}
                onToggle={(node, isCustom) => {
                  if (isCustom) toggleCustom(category, node);
                  else onToggleComplete(node);
                }}
                onAddCustom={addCustomNode}
                onDeleteCustom={(id) => deleteCustomNode(category, id)}
              />
            </div>
          );
        })}

        <div className="bg-card border border-dashed border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground text-sm">Custom Branch</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Add your own learning topics not covered in the Academy modules.</p>
          <AddNodeButton onAdd={(name) => addCustomNode("Custom", name)} />
          {(customNodes.Custom || []).map((node) => (
            <div key={node.id} className="mt-2">
              <TreeNode
                node={node}
                onToggle={() => toggleCustom("Custom", node)}
                onDelete={(id) => deleteCustomNode("Custom", id)}
                isCustom
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
