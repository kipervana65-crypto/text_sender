import { BlockResponse } from '../types/api';

type BlockViewProps = {
  block: BlockResponse;
  commentsCount: number;
  likesCount: number;
  isAuthenticated: boolean;
  isLikeDisabled: boolean;
  onLike: () => void;
  onUnlike: () => void;
  likesActionLoading: boolean;
};

export const BlockView = ({
  block,
  commentsCount,
  likesCount,
  isAuthenticated,
  isLikeDisabled,
  onLike,
  onUnlike,
  likesActionLoading,
}: BlockViewProps) => (
  <section className="mb-4 rounded border bg-white p-4">
    <h1 className="mb-2 text-xl font-semibold">{block.title}</h1>
    <p className="whitespace-pre-wrap text-slate-800">{block.text}</p>
    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
      <p>Комментариев: {commentsCount}</p>
      <p>Лайков: {likesCount}</p>
    </div>
    {isAuthenticated ? (
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          disabled={likesActionLoading || isLikeDisabled}
          onClick={onLike}
        >
          Поставить лайк
        </button>
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
          disabled={likesActionLoading}
          onClick={onUnlike}
        >
          Убрать лайк
        </button>
      </div>
    ) : null}
  </section>
);
