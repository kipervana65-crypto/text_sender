import { CommentResponse } from '../types/api';

export const CommentList = ({ comments }: { comments: CommentResponse[] }) => {
  if (!comments.length) {
    return <p className="rounded border bg-white p-3 text-sm text-slate-500">Комментариев пока нет.</p>;
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded border bg-white p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>{comment.username}</span>
            <span>{new Date(comment.created_at).toLocaleString()}</span>
          </div>
          <p className="text-sm text-slate-800">{comment.comment}</p>
        </li>
      ))}
    </ul>
  );
};
