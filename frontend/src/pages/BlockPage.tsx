import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlockView } from '../components/BlockView';
import { CommentForm } from '../components/CommentForm';
import { CommentList } from '../components/CommentList';
import { Loader } from '../components/Loader';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { BlockResponse, CommentResponse } from '../types/api';
import { getUserFriendlyError } from '../utils/errorMessages';

export const BlockPage = () => {
  const { id = '' } = useParams();
  const { isAuthenticated } = useAuth();

  const [block, setBlock] = useState<BlockResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [blockResponse, commentResponse] = await Promise.all([api.getBlock(id), api.getComments(id)]);
      setBlock(blockResponse);
      setComments(commentResponse.items);
    } catch (e) {
      setError(getUserFriendlyError(e));
    } finally {
      setLoading(false);
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
      <BlockView block={block} />
      <h2 className="mb-2 text-lg font-semibold">Комментарии</h2>
      {isAuthenticated ? (
        <CommentForm blockId={id} onSuccess={loadData} />
      ) : (
        <StatusMessage message="Войдите, чтобы оставить комментарий" type="info" />
      )}
      <CommentList comments={comments} />
    </section>
  );
};
