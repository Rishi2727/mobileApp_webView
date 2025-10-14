import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@/contexts/useLanguage';
import { setTranslationReference, setNavigationReference } from '@/store/api/client';

export const useApiClient = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleUnauthorized = useCallback(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    setTranslationReference(t);
    
    setNavigationReference(handleUnauthorized);
  }, [t, handleUnauthorized]);
};