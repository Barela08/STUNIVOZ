import { useCallback, useEffect, useState } from 'react';
import { getCollection, getCollectionWhere } from '../services/firebase';

export const useCollection = <T extends { id: string }>(collectionName: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getCollection(collectionName);
    if (result.success && result.data) {
      setData(result.data as T[]);
    } else {
      setError('Unable to load data right now.');
      setData([]);
    }
    setLoading(false);
  }, [collectionName]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
};

export const useFilteredCollection = <T extends { id: string }>(
  collectionName: string,
  field: string,
  value: unknown
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getCollectionWhere(collectionName, field, '==', value);
    if (result.success && result.data) {
      setData(result.data as T[]);
    } else {
      setError('Unable to load data right now.');
      setData([]);
    }
    setLoading(false);
  }, [collectionName, field, value]);

  useEffect(() => {
    if (value === undefined || value === null || value === '') {
      setData([]);
      setLoading(false);
      return;
    }
    refresh();
  }, [refresh, value]);

  return { data, loading, error, refresh };
};
