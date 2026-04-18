import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  ThumbsUp,
  MessageCircle,
  Loader2,
  Star,
} from "lucide-react";
import PillBadge from "@/components/ui/PillBadge";
import { api } from "@/lib/api";
import {
  difficultyColor,
  formatCommentTimestamp,
  formatModuleViews,
  normalizeModule,
} from "@/lib/academy";

function CommentSection({ moduleId, comments, setComments }) {
  const [newComment, setNewComment] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [openReplies, setOpenReplies] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [likedReplies, setLikedReplies] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const sortedComments = useMemo(
    () =>
      [...comments].sort((left, right) => {
        const leftScore = Number(left.likes || 0) + Number(left.replies?.length || 0);
        const rightScore = Number(right.likes || 0) + Number(right.replies?.length || 0);
        return rightScore - leftScore;
      }),
    [comments]
  );

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await api.postComment(moduleId, newComment.trim());
      setComments(response.comments || []);
      setNewComment("");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (commentId, replyId = null) => {
    if (replyId) {
      const replyKey = `${commentId}:${replyId}`;
      const action = likedReplies[replyKey] ? "dec" : "inc";
      const response = await api.likeReply(moduleId, commentId, replyId, action);
      setComments(response.comments || []);
      setLikedReplies((prev) => ({ ...prev, [replyKey]: !prev[replyKey] }));
      return;
    }

    const action = likedComments[commentId] ? "dec" : "inc";
    const response = await api.likeComment(moduleId, commentId, action);
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, likes: response.likes } : comment
      )
    );
    setLikedComments((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const submitReply = async (commentId) => {
    const replyText = replyDrafts[commentId]?.trim();
    if (!replyText) return;

    try {
      setSubmitting(true);
      const response = await api.postComment(moduleId, replyText, commentId);
      setComments(response.comments || []);
      setReplyDrafts((prev) => ({ ...prev, [commentId]: "" }));
      setOpenReplies((prev) => ({ ...prev, [commentId]: false }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
        <MessageCircle className="w-4 h-4" /> Discussion ({comments.length})
      </h3>

      <div className="flex gap-3 mb-5">
        <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-white text-xs font-bold">Y</span>
        </div>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 resize-none transition-all"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={addComment}
              disabled={!newComment.trim() || submitting}
              className="px-4 py-1.5 bg-navy text-white rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-navy/90 transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {sortedComments.map((comment) => (
          <div key={comment.id}>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-foreground text-xs font-bold">{(comment.user || "U")[0]}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-foreground">{comment.user}</p>
                  <span className="text-[11px] text-muted-foreground">
                    {formatCommentTimestamp(comment.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-2">{comment.text}</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(comment.id)}
                    className={`flex items-center gap-1 text-xs transition-colors ${
                      likedComments[comment.id]
                        ? "text-navy font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> {comment.likes || 0}
                  </button>
                  <button
                    onClick={() =>
                      setOpenReplies((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))
                    }
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Reply
                  </button>
                </div>

                {openReplies[comment.id] && (
                  <div className="flex gap-2 mt-3">
                    <textarea
                      value={replyDrafts[comment.id] || ""}
                      onChange={(event) =>
                        setReplyDrafts((prev) => ({ ...prev, [comment.id]: event.target.value }))
                      }
                      placeholder={`Reply to ${comment.user}...`}
                      rows={2}
                      className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-navy/20 resize-none"
                    />
                    <button
                      onClick={() => submitReply(comment.id)}
                      disabled={!replyDrafts[comment.id]?.trim() || submitting}
                      className="self-end px-3 py-1.5 bg-navy text-white rounded-lg text-xs font-medium disabled:opacity-40"
                    >
                      Reply
                    </button>
                  </div>
                )}

                {comment.replies.length > 0 && (
                  <div className="mt-3 ml-2 pl-3 border-l-2 border-border space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-foreground text-xs font-bold">{(reply.user || "U")[0]}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-semibold text-foreground">{reply.user}</p>
                            {reply.timestamp && (
                              <span className="text-[11px] text-muted-foreground">
                                {formatCommentTimestamp(reply.timestamp)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground">{reply.text}</p>
                          <button
                            onClick={() => toggleLike(comment.id, reply.id)}
                            className={`flex items-center gap-1 text-xs mt-1 transition-colors ${
                              likedReplies[`${comment.id}:${reply.id}`]
                                ? "text-navy font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" /> {reply.likes || 0}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShareBar({ title }) {
  const [copied, setCopied] = useState(false);
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`Learning: "${title}" on U2INVEST`);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 py-4 border-y border-border mt-5">
      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
        <Share2 className="w-3.5 h-3.5" /> Share:
      </span>
      <a
        href={`https://twitter.com/intent/tweet?url=${url}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 transition-colors"
        title="Share on Twitter"
      >
        <Twitter className="w-3.5 h-3.5 text-sky-500" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
        title="Share on Facebook"
      >
        <Facebook className="w-3.5 h-3.5 text-blue-600" />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-3.5 h-3.5 text-blue-700" />
      </a>
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors"
      >
        <Link2 className="w-3.5 h-3.5" />
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}

export default function ModuleModal({ mod, onClose, onToggleComplete, onModuleChange }) {
  const [detail, setDetail] = useState(mod);
  const [comments, setComments] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);

  useEffect(() => {
    if (!mod) return;

    let cancelled = false;

    async function loadModuleDetail() {
      try {
        setLoadingDetail(true);
        const response = await api.getAcademyModule(mod.module_id);

        if (!cancelled) {
          const normalized = normalizeModule(response);
          setDetail(normalized);
          setComments(response.comments || []);
          onModuleChange?.(normalized);
        }
      } finally {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      }
    }

    loadModuleDetail();

    return () => {
      cancelled = true;
    };
  }, [mod, onModuleChange]);

  if (!mod) return null;

  const activeModule = detail || mod;

  const handleToggleComplete = async () => {
    try {
      const completed = await onToggleComplete(activeModule);
      const updated = { ...activeModule, completed };
      setDetail(updated);
      onModuleChange?.(updated);
    } catch (error) {
      return null;
    }

    return null;
  };

  const handleRateModule = async (score) => {
    try {
      setRatingLoading(true);
      const response = await api.rateModule(activeModule.module_id, score);
      const updated = {
        ...activeModule,
        ratings: Number(response.avg || activeModule.ratings),
        ratings_count: Number(activeModule.ratings_count || 0) + 1,
      };

      setSelectedRating(score);
      setDetail(updated);
      onModuleChange?.(updated);
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="p-7">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <PillBadge variant={difficultyColor[activeModule.difficulty]}>
                    {activeModule.difficulty}
                  </PillBadge>
                  <span className="text-xs text-muted-foreground">{activeModule.category}</span>
                  {activeModule.completed && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                      Completed
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-2xl text-foreground">{activeModule.name}</h2>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={handleToggleComplete}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    activeModule.completed
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <CheckCircle
                    className={`w-3.5 h-3.5 ${activeModule.completed ? "fill-emerald-500 text-emerald-500" : ""}`}
                  />
                  {activeModule.completed ? "Completed" : "Mark done"}
                </button>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{activeModule.intro}</p>

            <div className="mb-6">
              {loadingDetail ? (
                <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p className="text-xs">Loading module details...</p>
                  </div>
                </div>
              ) : activeModule.video ? (
                <div>
                  <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${activeModule.video}?rel=0`}
                      className="w-full h-full"
                      allowFullScreen
                      title={activeModule.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                    {activeModule.source && (
                      <span>
                        Source: <span className="text-foreground font-medium">{activeModule.source}</span>
                      </span>
                    )}
                    <span>{formatModuleViews(activeModule.views)} views</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                      {activeModule.ratings.toFixed(1)} ({activeModule.ratings_count})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-xl flex items-center justify-center text-muted-foreground text-sm">
                  No video found for this module
                </div>
              )}
            </div>

            {activeModule.outcomes?.length > 0 && (
              <div className="mb-5">
                <h3 className="font-semibold text-foreground text-sm mb-3">Learning outcomes</h3>
                <ul className="space-y-2">
                  {activeModule.outcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeModule.takeaways?.length > 0 && (
              <div className="bg-muted/50 rounded-xl p-5 mb-1">
                <h3 className="font-semibold text-foreground text-sm mb-3">Key takeaways</h3>
                <ul className="space-y-2">
                  {activeModule.takeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-border bg-background p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">Rate this module</h3>
                  <p className="text-xs text-muted-foreground">
                    Your feedback updates the module rating shown across the Academy.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleRateModule(score)}
                      disabled={ratingLoading}
                      className="p-1 text-muted-foreground hover:text-gold transition-colors disabled:opacity-50"
                      title={`Rate ${score} stars`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          score <= (selectedRating || Math.round(activeModule.ratings))
                            ? "fill-gold text-gold"
                            : ""
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <ShareBar title={activeModule.name} />

            <CommentSection moduleId={activeModule.module_id} comments={comments} setComments={setComments} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
