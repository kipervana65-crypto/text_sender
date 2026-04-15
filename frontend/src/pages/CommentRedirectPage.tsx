import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../components/Loader';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { getUserFriendlyError } from '../utils/errorMessages';

export const CommentRedirectPage = () => {
  const { commentId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || isLoading) {
      return;
    }

    const parsedCommentId = Number(commentId);
    if (!Number.isInteger(parsedCommentId) || parsedCommentId <= 0) {
      setError('Некорректный идентификатор комментария.');
      return;
    }

    const loadComment = async () => {
      try {
        const comment = await api.getComment(parsedCommentId);
        navigate(`/blocks/${comment.block_id}#comment-${comment.id}`, { replace: true });
      } catch (e) {
        setError(getUserFriendlyError(e));
      }
    };

    void loadComment();
  }, [commentId, isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <Loader text="Проверяем доступ..." />;
  }

  if (!isAuthenticated) {
    const redirectPath = commentId ? `/comment/${commentId}` : '/';
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectPath)}`} replace />;
  }

  if (error) {
    return <StatusMessage message={error} type="error" />;
  }

  return <Loader text="Переходим к комментарию..." />;
};
