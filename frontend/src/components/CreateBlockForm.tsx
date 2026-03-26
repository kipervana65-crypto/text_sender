import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';
import { BlockResponse } from '../types/api';
import { getUserFriendlyError } from '../utils/errorMessages';
import { StatusMessage } from './StatusMessage';

const getShareLink = (block: BlockResponse) => {
  const parsedUrl = new URL(block.url_block, window.location.origin);
  const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
  const idFromPath = pathParts[pathParts.length - 1];
  const idFromQuery = parsedUrl.searchParams.get('uuid');
  const blockId = idFromQuery ?? idFromPath ?? block.id;

  return `${window.location.origin}/blocks/${blockId}`;
};

const copyText = async (text: string) => {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.append(textArea);
  textArea.select();

  const copied = document.execCommand('copy');
  textArea.remove();

  if (!copied) {
    throw new Error('Copy command failed');
  }
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
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingText, setEditingText] = useState('');
  const [busyBlockId, setBusyBlockId] = useState<string | null>(null);

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

    void loadBlocks();
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
      await copyText(link);
      setCopiedLink(link);
      setError(null);
    } catch {
      setError('Не удалось скопировать ссылку');
    }
  };

  const startEdit = (block: BlockResponse) => {
    setEditingBlockId(block.id);
    setEditingTitle(block.title);
    setEditingText(block.text);
    setBlocksError(null);
  };

  const cancelEdit = () => {
    setEditingBlockId(null);
    setEditingTitle('');
    setEditingText('');
  };

  const submitEdit = async (event: FormEvent, blockId: string) => {
    event.preventDefault();
    setBusyBlockId(blockId);
    setBlocksError(null);

    try {
      const updatedBlock = await api.updateBlock(blockId, { title: editingTitle, text: editingText });
      setBlocks((prev) => prev.map((block) => (block.id === blockId ? updatedBlock : block)));
      cancelEdit();
    } catch (e) {
      setBlocksError(getUserFriendlyError(e));
    } finally {
      setBusyBlockId(null);
    }
  };

  const handleDelete = async (blockId: string) => {
    setBusyBlockId(blockId);
    setBlocksError(null);

    try {
      await api.deleteBlock(blockId);
      setBlocks((prev) => prev.filter((block) => block.id !== blockId));
      if (editingBlockId === blockId) {
        cancelEdit();
      }
    } catch (e) {
      setBlocksError(getUserFriendlyError(e));
    } finally {
      setBusyBlockId(null);
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
            const isEditing = editingBlockId === block.id;
            const isBusy = busyBlockId === block.id;

            return (
              <article key={block.id} className="rounded border border-slate-200 p-3">
                {isEditing ? (
                  <form className="space-y-2" onSubmit={(event) => submitEdit(event, block.id)}>
                    <input
                      className="w-full rounded border px-3 py-2"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      required
                      minLength={1}
                      maxLength={50}
                    />
                    <textarea
                      className="min-h-24 w-full rounded border px-3 py-2 text-sm"
                      value={editingText}
                      onChange={(event) => setEditingText(event.target.value)}
                      required
                    />
                    <div className="flex gap-2">
                      <button className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50" disabled={isBusy}>
                        {isBusy ? 'Сохранение...' : 'Сохранить'}
                      </button>
                      <button
                        type="button"
                        className="rounded border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
                        onClick={cancelEdit}
                        disabled={isBusy}
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="font-semibold text-slate-900">{block.title}</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{block.text}</p>
                    <p className="mt-2 break-all text-sm text-blue-700">{link}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button className="rounded border border-slate-300 px-3 py-1.5 text-sm" onClick={() => handleCopyLink(link)}>
                        {copiedLink === link ? 'Скопировано' : 'Скопировать ссылку'}
                      </button>
                      <button
                        type="button"
                        className="rounded border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
                        onClick={() => startEdit(block)}
                        disabled={isBusy}
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
                        onClick={() => void handleDelete(block.id)}
                        disabled={isBusy}
                      >
                        {isBusy ? 'Удаление...' : 'Удалить'}
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
