import { useEffect, useState } from 'react';
import { listCommunities } from '../api/communitiesApi';

export default function useCommunities(limit = 50) {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const data = await listCommunities({ limit });
        if (!active) return;
        const items = data.items || [];
        setCommunities(items);
      } catch (err) {
        if (!active) return;
        console.error('Failed to load communities', err);
        setError(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [limit]);

  return { communities, loading, error };
}
