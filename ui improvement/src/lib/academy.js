export const difficultyLabels = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
};

export const difficultyColor = {
  Beginner: "green",
  Intermediate: "gold",
  Advanced: "red",
};

export const academyCategoryOrder = [
  "Foundations",
  "Economics",
  "Analysis",
  "Strategy",
  "Advanced",
  "Psychology",
  "Regulations",
];

export function getAverageRating(ratings = []) {
  if (!Array.isArray(ratings) || ratings.length === 0) {
    return 0;
  }

  return ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
}

export function normalizeModule(module) {
  const ratings = Array.isArray(module.ratings) ? module.ratings : [];
  const averageRating = Number(module.avg_rating ?? getAverageRating(ratings));

  return {
    ...module,
    module_id: module.id ?? module.module_id,
    category: module.cat ?? module.category,
    difficulty: difficultyLabels[module.difficulty] || module.difficulty || "Beginner",
    intro: module.video_intro ?? module.intro ?? "",
    ratings: Number.isFinite(averageRating) ? averageRating : 0,
    ratings_count: ratings.length || module.ratings_count || 0,
  };
}

export function formatModuleViews(value) {
  if (typeof value === "number") {
    return value.toLocaleString();
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return "0";
}

export function formatCommentTimestamp(value) {
  if (typeof value === "number") {
    return new Date(value * 1000).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  return "Just now";
}
