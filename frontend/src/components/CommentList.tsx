import { FormEvent, useState } from 'react';
import { api } from '../services/api';
import { CommentResponse } from '../types/api';
import { getUserFriendlyError } from '../utils/errorMessages';
import { StatusMessage } from './StatusMessage';

type CommentListProps = {
  comments: CommentResponse[];
  currentUsername?: string;
  onCommentsChanged: () => Promise<void>;
};

export const CommentList = ({ comments, currentUsername, onCommentsChanged }: CommentListProps) => {
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [busyCommentId, setBusyCommentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (comment: CommentResponse) => {
    setEditingCommentId(comment.id);
    setEditingValue(comment.comment);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingValue('');
  };

  const submitEdit = async (event: FormEvent, commentId: number) => {
    event.preventDefault();
    setBusyCommentId(commentId);
    setError(null);

    try {
      await api.updateComment(commentId, { comment: editingValue });
      cancelEdit();
      await onCommentsChanged();
    } catch (e) {
      setError(getUserFriendlyError(e));
    } finally {
      setBusyCommentId(null);
    }
  };

  const deleteComment = async (commentId: number) => {
    setBusyCommentId(commentId);
    setError(null);

    try {
      await api.deleteComment(commentId);
      if (editingCommentId === commentId) {
        cancelEdit();
      }
      await onCommentsChanged();
    } catch (e) {
      setError(getUserFriendlyError(e));
    } finally {
      setBusyCommentId(null);
    }
  };

  if (!comments.length) {
    return <p className="rounded border bg-white p-3 text-sm text-slate-500">Комментариев пока нет.</p>;
  }

  return (
    <div>
      {error ? <StatusMessage message={error} type="error" /> : null}
      <ul className="space-y-3">
        {comments.map((comment) => {
          const isOwnComment = currentUsername === comment.username;
          const isEditing = editingCommentId === comment.id;
          const isBusy = busyCommentId === comment.id;

          return (
            <li key={comment.id} className="rounded border bg-white p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span>{comment.username}</span>
                <span>{new Date(comment.created_at).toLocaleString()}</span>
              </div>

              {isEditing ? (
                <form onSubmit={(event) => submitEdit(event, comment.id)}>
                  <textarea
                    className="min-h-20 w-full rounded border px-3 py-2 text-sm"
                    value={editingValue}
                    onChange={(event) => setEditingValue(event.target.value)}
                    required
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      className="rounded bg-slate-900 px-3 py-1 text-sm text-white disabled:opacity-50"
                      disabled={isBusy}
                    >
                      {isBusy ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                      type="button"
                      className="rounded border px-3 py-1 text-sm text-slate-700 disabled:opacity-50"
                      onClick={cancelEdit}
                      disabled={isBusy}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-sm text-slate-800">{comment.comment}</p>
                  {isOwnComment ? (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="rounded border px-3 py-1 text-sm text-slate-700 disabled:opacity-50"
                        onClick={() => startEdit(comment)}
                        disabled={isBusy}
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 disabled:opacity-50"
                        onClick={() => void deleteComment(comment.id)}
                        disabled={isBusy}
                      >
                        {isBusy ? 'Удаление...' : 'Удалить'}
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
