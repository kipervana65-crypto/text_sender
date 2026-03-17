import { FormEvent, useState } from 'react';
import { api } from '../services/api';
import { getUserFriendlyError } from '../utils/errorMessages';
import { StatusMessage } from './StatusMessage';

export const CommentForm = ({ blockId, onSuccess }: { blockId: string; onSuccess: () => Promise<void> }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createComment(blockId, { comment });
      setComment('');
      await onSuccess();
    } catch (e) {
      setError(getUserFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mb-4 rounded border bg-white p-3" onSubmit={submit}>
      {error ? <StatusMessage message={error} type="error" /> : null}
      <label className="mb-1 block text-sm text-slate-700">Добавить комментарий</label>
      <textarea
        className="min-h-24 w-full rounded border px-3 py-2"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        required
      />
      <button className="mt-2 rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={loading}>
        {loading ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  );
};
