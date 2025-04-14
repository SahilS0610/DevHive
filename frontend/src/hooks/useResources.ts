import { useState, useEffect } from 'react';
import axios from 'axios';
import { Resource, ResourceType } from '@/types/resource';

interface ResourceResponse {
  data: Resource[];
  total: number;
  page: number;
  pageSize: number;
}

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchResources = async (params?: {
    page?: number;
    pageSize?: number;
    type?: ResourceType;
    search?: string;
    tags?: string[];
  }) => {
    try {
      setIsLoading(true);
      const response = await axios.get<ResourceResponse>('/api/resources', {
        params: {
          page: params?.page || page,
          pageSize: params?.pageSize || pageSize,
          type: params?.type,
          search: params?.search,
          tags: params?.tags?.join(',')
        }
      });

      setResources(response.data.data);
      setTotal(response.data.total);
      setPage(response.data.page);
      setPageSize(response.data.pageSize);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const createResource = async (resource: Partial<Resource>) => {
    try {
      const response = await axios.post<Resource>('/api/resources', resource);
      setResources(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateResource = async (id: string, resource: Partial<Resource>) => {
    try {
      const response = await axios.put<Resource>(`/api/resources/${id}`, resource);
      setResources(prev => prev.map(r => r.id === id ? response.data : r));
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteResource = async (id: string) => {
    try {
      await axios.delete(`/api/resources/${id}`);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const syncResource = async (id: string) => {
    try {
      const response = await axios.post<Resource>(`/api/resources/${id}/sync`);
      setResources(prev => prev.map(r => r.id === id ? response.data : r));
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return {
    resources,
    isLoading,
    error,
    total,
    page,
    pageSize,
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
    syncResource
  };
}; 