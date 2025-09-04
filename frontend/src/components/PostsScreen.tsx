import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost, fetchPosts } from '../lib/api';
import { useState } from 'react';

function PostsScreen() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    enabled: !!localStorage.getItem('token'),
  });

  const mutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      createPost(title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setErrorMessage('');
      setTitle('');
      setContent('');
    },
    onError: (error: any) => {
      if (error.response?.status === 422) {
        const details = error.response.data.details;
        const messages = Object.values(details).flat();
        setErrorMessage(messages.join(' '));
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
  });

  if (isLoading) return <div>Loading posts...</div>;
  if (isError) return <div>Error loading posts</div>;

  return (
    <div className="min-h-screen bg-brand-black text-gray-200 flex flex-col items-center py-10 px-4">
      <header className="w-full max-w-3xl text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">EnergeX Posts</h1>
        <p className="text-gray-400">
          Share your thoughts and see what others are posting.
        </p>
      </header>

      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create a Post</h2>
        {errorMessage && <p className="text-red-400 mb-4">{errorMessage}</p>}
        <input
          className="w-full mb-3 p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full mb-3 p-3 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          onClick={() => mutation.mutate({ title, content })}
          disabled={mutation.isPending}
          className="w-full py-3 rounded bg-brand-green hover:bg-brand-green-hover text-white font-semibold transition disabled:opacity-50"
        >
          {mutation.isPending ? "Posting..." : "Add Post"}
        </button>
      </div>

      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        {isLoading && <p className="text-gray-400">Loading posts...</p>}
        {isError && <p className="text-red-400">Error loading posts</p>}
        <ul className="space-y-4">
          {posts?.map((p: any) => (
            <li
              key={p.id}
              className="bg-gray-800 rounded-lg shadow p-4 hover:bg-gray-700 transition"
            >
              <h3 className="text-lg font-bold text-white">{p.title}</h3>
              <p className="text-gray-300">{p.content}</p>
              <span className="text-xs text-gray-500">User #{p.user_id}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PostsScreen;
