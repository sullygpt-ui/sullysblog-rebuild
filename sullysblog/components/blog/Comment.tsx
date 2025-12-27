'use client'

import { useState } from 'react'
import { CommentWithReplies } from '@/lib/queries/comments'
import { CommentForm } from './CommentForm'

type CommentProps = {
  comment: CommentWithReplies
  postId: string
  depth?: number
}

export function Comment({ comment, postId, depth = 0 }: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)

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

  const maxDepth = 3 // Maximum nesting level
  const indentClass = depth > 0 ? `ml-${Math.min(depth, maxDepth) * 6} pl-4 border-l-2 border-gray-200 dark:border-gray-700` : ''

  return (
    <div className={`mb-4 ${indentClass}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        {/* Comment Header */}
        <div className="flex items-center gap-3 mb-2">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
            {comment.author_name.charAt(0).toUpperCase()}
          </div>

          {/* Author & Date */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {comment.author_name}
              </span>
              {comment.author_url && (
                <a
                  href={comment.author_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              )}
            </div>
            <time className="text-sm text-gray-500 dark:text-gray-400" dateTime={comment.created_at}>
              {formatDate(comment.created_at)}
            </time>
          </div>
        </div>

        {/* Comment Content */}
        <div
          className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none
            prose-p:my-2 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: comment.content }}
        />

        {/* Reply Button */}
        {depth < maxDepth && (
          <div className="mt-3">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              {showReplyForm ? 'Cancel Reply' : 'Reply'}
            </button>
          </div>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-4 ml-6 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={() => setShowReplyForm(false)}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => (
            <Comment key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
