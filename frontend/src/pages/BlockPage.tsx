import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlockView } from '../components/BlockView';
import { CommentForm } from '../components/CommentForm';
import { CommentList } from '../components/CommentList';
import { Loader } from '../components/Loader';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { BlockResponse, CommentResponse, ThreadedComment } from '../types/api';
import { getUserFriendlyError } from '../utils/errorMessages';

export const BlockPage = () => {
  const { id = '' } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [block, setBlock] = useState<BlockResponse | null>(null);
  const [comments, setComments] = useState<ThreadedComment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [likesActionLoading, setLikesActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
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
      setError(getUserFriendlyError(e));
    } finally {
      setLoading(false);
    }
  }, [id, loadCommentTree]);

  const handleLike = useCallback(async () => {
    setLikesActionLoading(true);
    setError(null);
    try {
      await api.addLike(id);
      const likesResponse = await api.getTotalLikes(id);
      setLikesCount(likesResponse.like_total);
    } catch (e) {
      setError(getUserFriendlyError(e));
    } finally {
      setLikesActionLoading(false);
    }
  }, [id]);

  const handleUnlike = useCallback(async () => {
    setLikesActionLoading(true);
    setError(null);
    try {
      await api.removeLike(id);
      const likesResponse = await api.getTotalLikes(id);
      setLikesCount(likesResponse.like_total);
    } catch (e) {
      setError(getUserFriendlyError(e));
    } finally {
      setLikesActionLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) return <Loader />;
  if (error) return <StatusMessage message={error} type="error" />;
  if (!block) return <StatusMessage message="Контент не найден" type="error" />;

  return (
    <section>
      <BlockView
        block={block}
        commentsCount={countAllComments(comments)}
        likesCount={likesCount}
        isAuthenticated={isAuthenticated}
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
