import { useState, useEffect } from 'react';
import axios from 'axios';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'MEMBER' | 'LEAD' | 'ADMIN';
  skills: string[];
}

export const useProjectMembers = (projectId: string) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/members`);
        setMembers(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  const addMember = async (email: string, role: TeamMember['role']) => {
    try {
      const response = await axios.post(`/api/projects/${projectId}/members`, {
        email,
        role
      });
      setMembers([...members, response.data]);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      await axios.delete(`/api/projects/${projectId}/members/${memberId}`);
      setMembers(members.filter(member => member.id !== memberId));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateRole = async (memberId: string, newRole: TeamMember['role']) => {
    try {
      const response = await axios.patch(
        `/api/projects/${projectId}/members/${memberId}`,
        { role: newRole }
      );
      setMembers(members.map(member =>
        member.id === memberId ? response.data : member
      ));
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { members, isLoading, error, addMember, removeMember, updateRole };
}; 