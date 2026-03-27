import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlockView } from '../components/BlockView';
import { CommentForm } from '../components/CommentForm';
import { CommentList } from '../components/CommentList';
import { Loader } from '../components/Loader';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { ApiError, BlockResponse, CommentResponse, ThreadedComment } from '../types/api';
import { getUserFriendlyError } from '../utils/errorMessages';

export const BlockPage = () => {
  const { id = '' } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [block, setBlock] = useState<BlockResponse | null>(null);
  const [comments, setComments] = useState<ThreadedComment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [isLikeDisabled, setIsLikeDisabled] = useState(false);
  const [likesActionLoading, setLikesActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadCommentTree = useCallback(async (blockId: string, parentId?: number): Promise<ThreadedComment[]> => {
    const fetchBranch = async (currentParentId?: number): Promise<ThreadedComment[]> => {
      const response = await api.getComments(blockId, 1, 100, currentParentId);
      return Promise.all(
        response.items.map(async (comment: CommentResponse) => {
          const replies = await fetchBranch(comment.id);
          return {
            ...comment,
            replies,
          };
        }),
      );
    };

    return fetchBranch(parentId);
  }, []);

  const countAllComments = useCallback((items: ThreadedComment[]): number => {
    return items.reduce((total, item) => total + 1 + countAllComments(item.replies), 0);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setActionError(null);
    setIsLikeDisabled(false);
    try {
      const [blockResponse, threadedComments, likesResponse] = await Promise.all([
        api.getBlock(id),
        loadCommentTree(id),
        api.getTotalLikes(id),
      ]);
      setBlock(blockResponse);
      setComments(threadedComments);
      setLikesCount(likesResponse.like_total);
    } catch (e) {
      setLoadError(getUserFriendlyError(e));
    } finally {
      setLoading(false);
    }
  }, [id, loadCommentTree]);

  const handleLike = useCallback(async () => {
    setLikesActionLoading(true);
    setActionError(null);
    try {
      await api.addLike(id);
      const likesResponse = await api.getTotalLikes(id);
      setLikesCount(likesResponse.like_total);
      setIsLikeDisabled(true);
    } catch (e) {
      if (e instanceof ApiError && e.status === 400 && e.message === 'Already liked') {
        setIsLikeDisabled(true);
        return;
      }
      setActionError(getUserFriendlyError(e));
    } finally {
      setLikesActionLoading(false);
    }
  }, [id]);

  const handleUnlike = useCallback(async () => {
    setLikesActionLoading(true);
    setActionError(null);
    try {
      await api.removeLike(id);
      const likesResponse = await api.getTotalLikes(id);
      setLikesCount(likesResponse.like_total);
      setIsLikeDisabled(false);
    } catch (e) {
      setActionError(getUserFriendlyError(e));
    } finally {
      setLikesActionLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) return <Loader />;
  if (loadError) return <StatusMessage message={loadError} type="error" />;
  if (!block) return <StatusMessage message="Контент не найден" type="error" />;

  return (
    <section>
      {actionError ? <StatusMessage message={actionError} type="error" /> : null}
      <BlockView
        block={block}
        commentsCount={countAllComments(comments)}
        likesCount={likesCount}
        isAuthenticated={isAuthenticated}
        isLikeDisabled={isLikeDisabled}
        onLike={handleLike}
        onUnlike={handleUnlike}
        likesActionLoading={likesActionLoading}
      />
      <h2 className="mb-2 text-lg font-semibold">Комментарии</h2>
      {isAuthenticated ? (
        <CommentForm blockId={id} onSuccess={loadData} />
      ) : (
        <StatusMessage message="Войдите, чтобы оставить комментарий" type="info" />
      )}
      <CommentList
        blockId={id}
        comments={comments}
        currentUsername={user?.username}
        isAuthenticated={isAuthenticated}
        onCommentsChanged={loadData}
      />
    </section>
  );
};
