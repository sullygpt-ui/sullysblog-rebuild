'use client'

import { useState, useEffect } from 'react'
import { CommentWithReplies, CommentSortOption } from '@/lib/queries/comments'
import { Comment } from './Comment'
import { CommentForm } from './CommentForm'

type CommentListProps = {
  comments: CommentWithReplies[]
  postId: string
  authorEmail?: string
  isAdmin?: boolean
}

export function CommentList({ comments: initialComments, postId, authorEmail, isAdmin = false }: CommentListProps) {
  const [comments, setComments] = useState(initialComments)
  const [sortBy, setSortBy] = useState<CommentSortOption>('newest')
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({})

  // Load user votes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`comment_votes_${postId}`)
    if (stored) {
      try {
        setUserVotes(JSON.parse(stored))
      } catch {
        // Invalid stored data
      }
    }
  }, [postId])

  // Sort comments client-side when sortBy changes
  useEffect(() => {
    const sortComments = (list: CommentWithReplies[]): CommentWithReplies[] => {
      const sorted = [...list].sort((a, b) => {
        // Pinned always first
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1

        // Best second
        if (a.is_best && !b.is_best) return -1
        if (!a.is_best && b.is_best) return 1

        switch (sortBy) {
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          case 'most_replies':
            return (b.reply_count || b.replies?.length || 0) - (a.reply_count || a.replies?.length || 0)
          case 'most_votes':
            return ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0))
          case 'newest':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
      })

      return sorted
    }

    setComments(sortComments(initialComments))
  }, [sortBy, initialComments])

  const commentCount = comments.reduce((total, comment) => {
    const countReplies = (c: CommentWithReplies): number => {
      return 1 + (c.replies?.reduce((sum, reply) => sum + countReplies(reply), 0) || 0)
    }
    return total + countReplies(comment)
  }, 0)

  const handleVote = async (commentId: string, voteType: 'up' | 'down') => {
    const currentVote = userVotes[commentId]

    // If clicking the same vote, remove it
    if (currentVote === voteType) {
      const newVotes = { ...userVotes }
      delete newVotes[commentId]
      setUserVotes(newVotes)
      localStorage.setItem(`comment_votes_${postId}`, JSON.stringify(newVotes))

      // Update comment in state
      updateCommentVote(commentId, voteType, -1)

      // Send to API
      await fetch('/api/comments/vote', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId })
      })
    } else {
      // New vote or changing vote
      const newVotes = { ...userVotes, [commentId]: voteType }
      setUserVotes(newVotes)
      localStorage.setItem(`comment_votes_${postId}`, JSON.stringify(newVotes))

      // Update comment in state
      if (currentVote) {
        // Changing vote - remove old, add new
        updateCommentVote(commentId, currentVote, -1)
      }
      updateCommentVote(commentId, voteType, 1)

      // Send to API
      await fetch('/api/comments/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, voteType })
      })
    }
  }

  const updateCommentVote = (commentId: string, voteType: 'up' | 'down', delta: number) => {
    const updateInTree = (list: CommentWithReplies[]): CommentWithReplies[] => {
      return list.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            upvotes: voteType === 'up' ? (comment.upvotes || 0) + delta : comment.upvotes,
            downvotes: voteType === 'down' ? (comment.downvotes || 0) + delta : comment.downvotes
          }
        }
        if (comment.replies?.length) {
          return { ...comment, replies: updateInTree(comment.replies) }
        }
        return comment
      })
    }
    setComments(updateInTree(comments))
  }

  const handlePin = async (commentId: string) => {
    const updateInTree = (list: CommentWithReplies[]): CommentWithReplies[] => {
      return list.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, is_pinned: !comment.is_pinned }
        }
        if (comment.replies?.length) {
          return { ...comment, replies: updateInTree(comment.replies) }
        }
        return comment
      })
    }
    setComments(updateInTree(comments))

    await fetch('/api/admin/comments/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId })
    })
  }

  const handleMarkBest = async (commentId: string) => {
    const updateInTree = (list: CommentWithReplies[]): CommentWithReplies[] => {
      return list.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, is_best: !comment.is_best }
        }
        if (comment.replies?.length) {
          return { ...comment, replies: updateInTree(comment.replies) }
        }
        return comment
      })
    }
    setComments(updateInTree(comments))

    await fetch('/api/admin/comments/best', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId })
    })
  }

  return (
    <div>
      {/* Header with count and sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
        </h2>

        {commentCount > 1 && (
          <div className="flex items-center gap-2">
            <label htmlFor="sort-comments" className="text-sm text-gray-600 dark:text-gray-400">
              Sort by:
            </label>
            <select
              id="sort-comments"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CommentSortOption)}
              className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_replies">Most Replies</option>
              <option value="most_votes">Most Votes</option>
            </select>
          </div>
        )}
      </div>

      {/* Comment Form */}
      <div className="mb-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Leave a Comment
        </h3>
        <CommentForm postId={postId} />
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 text-lg">No comments yet.</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              postId={postId}
              authorEmail={authorEmail}
              isAdmin={isAdmin}
              onVote={handleVote}
              onPin={isAdmin ? handlePin : undefined}
              onMarkBest={isAdmin ? handleMarkBest : undefined}
              userVotes={userVotes}
            />
          ))}
        </div>
      )}
    </div>
  )
}
