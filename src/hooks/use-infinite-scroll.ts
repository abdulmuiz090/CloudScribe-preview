
import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isLoading?: boolean;
}

export function useInfiniteScroll({
  hasNextPage,
  fetchNextPage,
  isLoading = false,
}: UseInfiniteScrollProps) {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        if (hasNextPage && !isLoading && !isFetching) {
          setIsFetching(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isLoading, isFetching]);

  useEffect(() => {
    if (!isFetching) return;
    
    fetchNextPage();
    setIsFetching(false);
  }, [isFetching, fetchNextPage]);

  return { isFetching };
}
