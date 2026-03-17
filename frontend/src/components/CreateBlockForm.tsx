import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';
import { BlockResponse } from '../types/api';
import { getUserFriendlyError } from '../utils/errorMessages';
import { StatusMessage } from './StatusMessage';

const getShareLink = (block: BlockResponse) => {
  const idFromUrl = block.url_block.split('/').slice(-1)[0] ?? block.id;
  return `${window.location.origin}/blocks/${idFromUrl}`;
};

export const CreateBlockForm = () => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blocksError, setBlocksError] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<BlockResponse[]>([]);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    const loadBlocks = async () => {
      try {
        const existingBlocks = await api.getBlocks();
        setBlocks(existingBlocks);
      } catch (e) {
        setBlocksError(getUserFriendlyError(e));
      } finally {
        setListLoading(false);
      }
    };

    loadBlocks();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setCopiedLink(null);

    try {
      const block = await api.createBlock({ title, text });
      const shareLink = getShareLink(block);
      setBlocks((prev) => [block, ...prev]);
      setGeneratedLink(shareLink);
      setTitle('');
      setText('');
    } catch (e) {
      setError(getUserFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(link);
    } catch {
      setError('Не удалось скопировать ссылку');
    }
  };

  return (
    <section className="space-y-4 rounded-lg border bg-white p-4">
      <h1 className="text-xl font-semibold">Создать текстовый блок</h1>
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
        <div className="space-y-2 rounded border border-green-200 bg-green-50 p-3">
          <StatusMessage message="Блок успешно создан" type="success" />
          <p className="break-all text-sm text-slate-800">{generatedLink}</p>
          <button className="rounded border border-slate-300 px-3 py-1.5 text-sm" onClick={() => handleCopyLink(generatedLink)}>
            {copiedLink === generatedLink ? 'Скопировано' : 'Скопировать'}
          </button>
        </div>
      ) : null}

      <div className="space-y-3 rounded border border-slate-200 p-3">
        <h2 className="text-lg font-medium">Созданные блоки</h2>
        {blocksError ? <StatusMessage message={blocksError} type="error" /> : null}
        {listLoading ? <p className="text-sm text-slate-500">Загрузка блоков...</p> : null}
        {!listLoading && !blocks.length ? <p className="text-sm text-slate-500">Пока нет созданных блоков.</p> : null}

        <div className="space-y-3">
          {blocks.map((block) => {
            const link = getShareLink(block);
            return (
              <article key={block.id} className="rounded border border-slate-200 p-3">
                <h3 className="font-semibold text-slate-900">{block.title}</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{block.text}</p>
                <p className="mt-2 break-all text-sm text-blue-700">{link}</p>
                <button className="mt-2 rounded border border-slate-300 px-3 py-1.5 text-sm" onClick={() => handleCopyLink(link)}>
                  {copiedLink === link ? 'Скопировано' : 'Скопировать ссылку'}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
