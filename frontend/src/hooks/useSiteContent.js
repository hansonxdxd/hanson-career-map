import { useState, useEffect } from 'react';
import { getContent } from '../lib/api';
import { siteContent as fallbackContent } from '../data/mockData';

export function useSiteContent() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getContent()
      .then((data) => {
        if (mounted) setContent(data);
      })
      .catch(() => {
        if (mounted) setContent(fallbackContent);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { content, loading };
}
