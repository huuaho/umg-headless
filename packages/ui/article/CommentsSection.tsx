"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchComments, postComment } from "@umg/api";
import type { WpComment } from "@umg/api";

interface CommentThread {
  comment: WpComment;
  replies: CommentThread[];
}

function buildCommentTree(comments: WpComment[]): CommentThread[] {
  const threadMap = new Map<number, CommentThread>();
  const roots: CommentThread[] = [];

  for (const comment of comments) {
    threadMap.set(comment.id, { comment, replies: [] });
  }

  for (const comment of comments) {
    const node = threadMap.get(comment.id)!;

    if (comment.parent === 0) {
      roots.push(node);
    } else {
      const parentNode = threadMap.get(comment.parent);
      if (!parentNode) {
        // Parent not found (deleted?), treat as top-level
        roots.push(node);
      } else if (parentNode.comment.parent !== 0) {
        // Parent is already a reply — flatten to grandparent
        const grandparentNode = threadMap.get(parentNode.comment.parent);
        if (grandparentNode) {
          grandparentNode.replies.push(node);
        } else {
          roots.push(node);
        }
      } else {
        parentNode.replies.push(node);
      }
    }
  }

  return roots;
}

function validateForm(
  name: string,
  email: string,
  text: string
): string | null {
  if (!name.trim()) return "Name is required";
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "Invalid email format";
  if (!text.trim()) return "Comment text is required";
  return null;
}

function formatDate(dateGmt: string): string {
  return new Date(dateGmt + "Z").toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// --- Subcomponents ---

function CommentForm({
  heading,
  name,
  email,
  text,
  onNameChange,
  onEmailChange,
  onTextChange,
  onSubmit,
  isSubmitting,
  error,
  success,
  onCancel,
}: {
  heading: string;
  name: string;
  email: string;
  text: string;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onTextChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
  onCancel?: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-8">
      <h3 className="text-lg font-semibold mb-4">{heading}</h3>
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>
      <textarea
        placeholder="Write your comment..."
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-y"
      />
      <div className="flex items-center gap-3 mt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Posting...
            </span>
          ) : (
            "Post Comment"
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-500 hover:text-black transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
    </form>
  );
}

const INITIAL_THREADS = 3;
const THREADS_PER_PAGE = 3;
const INITIAL_REPLIES = 1;
const REPLIES_PER_PAGE = 2;

function CommentItem({
  thread,
  depth,
  replyingTo,
  onReply,
  onCancelReply,
  replyName,
  replyEmail,
  replyText,
  onReplyNameChange,
  onReplyEmailChange,
  onReplyTextChange,
  onReplySubmit,
  isSubmittingReply,
  replyError,
  replySuccess,
  visibleReplyCount,
  onShowMoreReplies,
}: {
  thread: CommentThread;
  depth: number;
  replyingTo: number | null;
  onReply: (id: number) => void;
  onCancelReply: () => void;
  replyName: string;
  replyEmail: string;
  replyText: string;
  onReplyNameChange: (v: string) => void;
  onReplyEmailChange: (v: string) => void;
  onReplyTextChange: (v: string) => void;
  onReplySubmit: (e: React.FormEvent, parentId: number) => void;
  isSubmittingReply: boolean;
  replyError: string | null;
  replySuccess: string | null;
  visibleReplyCount: number;
  onShowMoreReplies: (id: number) => void;
}) {
  const { comment, replies } = thread;
  const visibleReplies =
    depth === 0 ? replies.slice(0, visibleReplyCount) : replies;
  const hiddenReplyCount =
    depth === 0 ? replies.length - visibleReplies.length : 0;

  return (
    <div className={depth > 0 ? "ml-6 md:ml-10" : ""}>
      <div className="py-4 border-b border-gray-100">
        {/* Author + Date */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-black">
            {comment.author_name}
          </span>
          <span className="text-sm text-gray-400">&middot;</span>
          <time className="text-sm text-gray-500" dateTime={comment.date_gmt}>
            {formatDate(comment.date_gmt)}
          </time>
        </div>

        {/* Comment body */}
        <div
          className="text-gray-700 text-sm mt-1 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: comment.content.rendered }}
        />

        {/* Reply button (top-level only) */}
        {depth === 0 && (
          <button
            onClick={() => onReply(comment.id)}
            className="mt-2 text-sm text-gray-500 hover:text-black transition-colors"
          >
            Reply
          </button>
        )}

        {/* Inline reply form */}
        {replyingTo === comment.id && (
          <CommentForm
            heading="Reply"
            name={replyName}
            email={replyEmail}
            text={replyText}
            onNameChange={onReplyNameChange}
            onEmailChange={onReplyEmailChange}
            onTextChange={onReplyTextChange}
            onSubmit={(e) => onReplySubmit(e, comment.id)}
            isSubmitting={isSubmittingReply}
            error={replyError}
            success={replySuccess}
            onCancel={onCancelReply}
          />
        )}
      </div>

      {/* Replies */}
      {visibleReplies.map((reply) => (
        <CommentItem
          key={reply.comment.id}
          thread={reply}
          depth={depth + 1}
          replyingTo={replyingTo}
          onReply={onReply}
          onCancelReply={onCancelReply}
          replyName={replyName}
          replyEmail={replyEmail}
          replyText={replyText}
          onReplyNameChange={onReplyNameChange}
          onReplyEmailChange={onReplyEmailChange}
          onReplyTextChange={onReplyTextChange}
          onReplySubmit={onReplySubmit}
          isSubmittingReply={isSubmittingReply}
          replyError={replyError}
          replySuccess={replySuccess}
          visibleReplyCount={visibleReplyCount}
          onShowMoreReplies={onShowMoreReplies}
        />
      ))}

      {/* Show more replies button */}
      {hiddenReplyCount > 0 && (
        <div className="ml-6 md:ml-10 py-3">
          <button
            onClick={() => onShowMoreReplies(comment.id)}
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Show {hiddenReplyCount} more{" "}
            {hiddenReplyCount === 1 ? "reply" : "replies"}
          </button>
        </div>
      )}
    </div>
  );
}

// --- Main Component ---

interface CommentsSectionProps {
  postId: number;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  // Comments data
  const [comments, setComments] = useState<WpComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Top-level comment form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Reply form
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyName, setReplyName] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  // Pagination
  const [visibleThreadCount, setVisibleThreadCount] = useState(INITIAL_THREADS);
  const [replyLimits, setReplyLimits] = useState<Map<number, number>>(
    new Map()
  );

  // Fetch comments on mount
  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchComments(postId);
        if (!cancelled) setComments(data);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load comments"
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadComments();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  // Build comment tree
  const threads = useMemo(() => buildCommentTree(comments), [comments]);

  // Count only approved comments
  const commentCount = comments.length;

  // Submit top-level comment
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const validationError = validateForm(name, email, commentText);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await postComment({
        post: postId,
        content: commentText.trim(),
        author_name: name.trim(),
        author_email: email.trim(),
      });

      if (created.status === "hold") {
        setSubmitSuccess(
          "Your comment has been submitted and is pending moderation."
        );
      } else {
        setSubmitSuccess("Comment posted successfully!");
        setComments((prev) => [...prev, created]);
      }
      setCommentText("");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to post comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Submit reply
  async function handleReplySubmit(e: React.FormEvent, parentId: number) {
    e.preventDefault();
    setReplyError(null);
    setReplySuccess(null);

    const validationError = validateForm(replyName, replyEmail, replyText);
    if (validationError) {
      setReplyError(validationError);
      return;
    }

    setIsSubmittingReply(true);
    try {
      const created = await postComment({
        post: postId,
        content: replyText.trim(),
        author_name: replyName.trim(),
        author_email: replyEmail.trim(),
        parent: parentId,
      });

      if (created.status === "hold") {
        setReplySuccess(
          "Your reply has been submitted and is pending moderation."
        );
      } else {
        setReplySuccess("Reply posted successfully!");
        setComments((prev) => [...prev, created]);
      }
      setReplyText("");
      setTimeout(() => {
        setReplyingTo(null);
        setReplySuccess(null);
      }, 2000);
    } catch (err) {
      setReplyError(
        err instanceof Error ? err.message : "Failed to post reply"
      );
    } finally {
      setIsSubmittingReply(false);
    }
  }

  // Reply form toggle
  function openReplyForm(commentId: number) {
    setReplyingTo(commentId);
    setReplyName(name); // Pre-fill from top-level form
    setReplyEmail(email);
    setReplyText("");
    setReplyError(null);
    setReplySuccess(null);
  }

  function closeReplyForm() {
    setReplyingTo(null);
    setReplyError(null);
    setReplySuccess(null);
  }

  // Retry fetch
  function retry() {
    setError(null);
    setIsLoading(true);
    fetchComments(postId)
      .then(setComments)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load comments"
        )
      )
      .finally(() => setIsLoading(false));
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold mb-6">
        Comments{!isLoading && !error && ` (${commentCount})`}
      </h2>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-full bg-gray-100 rounded mb-1" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 mb-4">
          <p>{error}</p>
          <button
            onClick={retry}
            className="mt-2 text-sm font-medium text-gray-800 hover:text-black underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Comments list */}
      {!isLoading && !error && (
        <>
          {threads.length === 0 ? (
            <p className="text-sm text-gray-500 mb-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div>
              {threads.slice(0, visibleThreadCount).map((thread) => (
                <CommentItem
                  key={thread.comment.id}
                  thread={thread}
                  depth={0}
                  replyingTo={replyingTo}
                  onReply={openReplyForm}
                  onCancelReply={closeReplyForm}
                  replyName={replyName}
                  replyEmail={replyEmail}
                  replyText={replyText}
                  onReplyNameChange={setReplyName}
                  onReplyEmailChange={setReplyEmail}
                  onReplyTextChange={setReplyText}
                  onReplySubmit={handleReplySubmit}
                  isSubmittingReply={isSubmittingReply}
                  replyError={replyError}
                  replySuccess={replySuccess}
                  visibleReplyCount={
                    replyLimits.get(thread.comment.id) ?? INITIAL_REPLIES
                  }
                  onShowMoreReplies={(id: number) =>
                    setReplyLimits((prev) => {
                      const next = new Map(prev);
                      next.set(
                        id,
                        (next.get(id) ?? INITIAL_REPLIES) + REPLIES_PER_PAGE
                      );
                      return next;
                    })
                  }
                />
              ))}
              {threads.length > visibleThreadCount && (
                <div className="py-4 text-center">
                  <button
                    onClick={() =>
                      setVisibleThreadCount((prev) => prev + THREADS_PER_PAGE)
                    }
                    className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                  >
                    Show more comments ({threads.length - visibleThreadCount}{" "}
                    remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* New comment form */}
      <CommentForm
        heading="Leave a Comment"
        name={name}
        email={email}
        text={commentText}
        onNameChange={setName}
        onEmailChange={setEmail}
        onTextChange={setCommentText}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={submitError}
        success={submitSuccess}
      />
    </section>
  );
}
