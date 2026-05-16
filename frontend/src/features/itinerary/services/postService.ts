import apiClient from '@/shared/api/apiClient';

export interface CreatePostDto {
  itineraryId: number;
  tieude: string;
  noidung?: string;
  hinhanh_cover?: string;
}

export const postService = {
  createPost: async (dto: CreatePostDto) => {
    const res = await apiClient.post('/posts', dto);
    return res.data;
  },

  getPosts: async (page: number = 1, limit: number = 10) => {
    const res = await apiClient.get('/posts', { params: { page, limit } });
    return res;
  },

  getPostById: async (id: number) => {
    const res = await apiClient.get(`/posts/${id}`);
    return res.data;
  },

  toggleLike: async (id: number) => {
    const res = await apiClient.post(`/posts/${id}/like`);
    return res.data;
  },

  addComment: async (id: number, noidung: string) => {
    const res = await apiClient.post(`/posts/${id}/comments`, { noidung });
    return res.data;
  },

  cloneItinerary: async (id: number) => {
    const res = await apiClient.post(`/posts/${id}/clone`);
    return res.data;
  }
};
