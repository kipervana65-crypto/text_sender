import { FormEvent, useState } from 'react';
import { api } from '../services/api';
import { getUserFriendlyError } from '../utils/errorMessages';
import { StatusMessage } from './StatusMessage';

export const CreateBlockForm = () => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const block = await api.createBlock({ title, text });
      const idFromUrl = block.url_block.split('/').slice(-1)[0] ?? block.id;
      const shareLink = `${window.location.origin}/blocks/${idFromUrl}`;
      setGeneratedLink(shareLink);
      setTitle('');
      setText('');
    } catch (e) {
      setError(getUserFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg border bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Создать текстовый блок</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <StatusMessage message={error} type="error" /> : null}
        <div>
          <label className="mb-1 block text-sm text-slate-700">Заголовок</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            minLength={1}
            maxLength={50}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Текст</label>
          <textarea
            className="min-h-36 w-full rounded border px-3 py-2"
            value={text}
            onChange={(event) => setText(event.target.value)}
            required
          />
        </div>

        <button disabled={loading} className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
          {loading ? 'Создание...' : 'Создать'}
        </button>
      </form>

      {generatedLink ? (
        <div className="mt-4 space-y-2 rounded border border-green-200 bg-green-50 p-3">
          <StatusMessage message="Блок успешно создан" type="success" />
          <p className="break-all text-sm text-slate-800">{generatedLink}</p>
          <button
            className="rounded border border-slate-300 px-3 py-1.5 text-sm"
            onClick={() => navigator.clipboard.writeText(generatedLink)}
          >
            Скопировать
          </button>
        </div>
      ) : null}
    </section>
  );
};
