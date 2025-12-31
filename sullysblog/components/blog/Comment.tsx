'use client'

import { useState } from 'react'
import { CommentWithReplies } from '@/lib/queries/comments'
import { CommentForm } from './CommentForm'

type CommentProps = {
  comment: CommentWithReplies
  postId: string
  authorEmail?: string // The blog post author's email for OP badge
  depth?: number
  isAdmin?: boolean
  onVote?: (commentId: string, voteType: 'up' | 'down') => void
  onPin?: (commentId: string) => void
  onMarkBest?: (commentId: string) => void
  userVotes?: Record<string, 'up' | 'down'>
}

export function Comment({
  comment,
  postId,
  authorEmail,
  depth = 0,
  isAdmin = false,
  onVote,
  onPin,
  onMarkBest,
  userVotes = {}
}: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  const maxDepth = 3
  const isOP = authorEmail && comment.author_email.toLowerCase() === authorEmail.toLowerCase()
  const isAuthorReply = comment.is_author_reply
  const voteScore = (comment.upvotes || 0) - (comment.downvotes || 0)
  const userVote = userVotes[comment.id]
  const replyCount = comment.reply_count || comment.replies?.length || 0

  // Indentation styles
  const getIndentStyle = () => {
    if (depth === 0) return ''
    const indentPx = Math.min(depth, maxDepth) * 24
    return `ml-[${indentPx}px] md:ml-[${Math.min(depth, maxDepth) * 40}px]`
  }

  return (
    <div className={`mb-3 ${depth > 0 ? 'ml-4 md:ml-10 pl-3 md:pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
      <div className={`
        rounded-lg p-4 transition-all
        ${comment.is_pinned ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' : ''}
        ${comment.is_best ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : ''}
        ${isAuthorReply ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''}
        ${!comment.is_pinned && !comment.is_best && !isAuthorReply ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700' : ''}
      `}>
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-2">
          {comment.is_pinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Pinned
            </span>
          )}
          {comment.is_best && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Best Comment
            </span>
          )}
          {isAuthorReply && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              Author
            </span>
          )}
        </div>

        {/* Comment Header */}
        <div className="flex items-center gap-3 mb-2">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
            isAuthorReply
              ? 'bg-gradient-to-br from-blue-600 to-blue-800'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
          }`}>
            {comment.author_name.charAt(0).toUpperCase()}
          </div>

          {/* Author & Date */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 dark:text-white truncate">
                {comment.author_name}
              </span>
              {isOP && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-blue-600 text-white rounded">
                  OP
                </span>
              )}
              {comment.author_url && (
                <a
                  href={comment.author_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              )}
            </div>
            <time
              className="text-sm text-gray-500 dark:text-gray-400"
              dateTime={comment.created_at}
              title={formatDate(comment.created_at)}
            >
              {formatRelativeTime(comment.created_at)}
            </time>
          </div>

          {/* Collapse button for threads with replies (mobile friendly) */}
          {replyCount > 0 && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 md:hidden"
              aria-label={isCollapsed ? 'Expand replies' : 'Collapse replies'}
            >
              <svg
                className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Comment Content */}
        <div
          className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none
            prose-p:my-2 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: comment.content }}
        />

        {/* Action Bar */}
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          {/* Voting */}
          {onVote && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onVote(comment.id, 'up')}
                className={`p-1 rounded transition-colors ${
                  userVote === 'up'
                    ? 'text-green-600 bg-green-100 dark:bg-green-900/30'
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
                aria-label="Upvote"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <span className={`text-sm font-medium min-w-[24px] text-center ${
                voteScore > 0 ? 'text-green-600' : voteScore < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {voteScore}
              </span>
              <button
                onClick={() => onVote(comment.id, 'down')}
                className={`p-1 rounded transition-colors ${
                  userVote === 'down'
                    ? 'text-red-600 bg-red-100 dark:bg-red-900/30'
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
                aria-label="Downvote"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}

          {/* Reply Count */}
          {replyCount > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </span>
          )}

          {/* Reply Button */}
          {depth < maxDepth && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              {showReplyForm ? 'Cancel' : 'Reply'}
            </button>
          )}

          {/* Admin Actions */}
          {isAdmin && (
            <div className="flex items-center gap-2 ml-auto">
              {onPin && (
                <button
                  onClick={() => onPin(comment.id)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    comment.is_pinned
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {comment.is_pinned ? 'Unpin' : 'Pin'}
                </button>
              )}
              {onMarkBest && (
                <button
                  onClick={() => onMarkBest(comment.id)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    comment.is_best
                      ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {comment.is_best ? 'Remove Best' : 'Mark Best'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-3 ml-4 md:ml-10 pl-3 md:pl-4 border-l-2 border-blue-200 dark:border-blue-800">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={() => setShowReplyForm(false)}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && !isCollapsed && (
        <div className="mt-3">
          {comment.replies.map(reply => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              authorEmail={authorEmail}
              depth={depth + 1}
              isAdmin={isAdmin}
              onVote={onVote}
              onPin={onPin}
              onMarkBest={onMarkBest}
              userVotes={userVotes}
            />
          ))}
        </div>
      )}

      {/* Collapsed indicator */}
      {comment.replies && comment.replies.length > 0 && isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="mt-2 ml-4 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
        </button>
      )}
    </div>
  )
}
