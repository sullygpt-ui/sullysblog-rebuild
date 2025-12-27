import { CommentWithReplies } from '@/lib/queries/comments'
import { Comment } from './Comment'
import { CommentForm } from './CommentForm'

type CommentListProps = {
  comments: CommentWithReplies[]
  postId: string
}

export function CommentList({ comments, postId }: CommentListProps) {
  const commentCount = comments.reduce((total, comment) => {
    const countReplies = (c: CommentWithReplies): number => {
      return 1 + (c.replies?.reduce((sum, reply) => sum + countReplies(reply), 0) || 0)
    }
    return total + countReplies(comment)
  }, 0)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
      </h2>

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
        <div className="space-y-6">
          {comments.map(comment => (
            <Comment key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}
    </div>
  )
}
