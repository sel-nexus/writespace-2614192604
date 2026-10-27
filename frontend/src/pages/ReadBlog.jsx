import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Avatar from '../components/Avatar.jsx';
import { getSession, getPosts } from '../utils/storage.js';
import { canManagePost, formatPostDate } from '../utils/posts.js';
import { deletePost, subscribeToPostsUpdated } from '../utils/posts.js';

/** Show a full post and restrict destructive or edit actions by ownership. */
export default function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const [, setPostsRevision] = useState(0);
  useEffect(() => {
    const refreshPosts = () => setPostsRevision((revision) => revision + 1);
    return subscribeToPostsUpdated(refreshPosts);
  }, []);
  const post = getPosts().find((entry) => entry.id === id);
  if (!session) return <Navigate to="/login" replace />;
  if (!post) {
    return (
      <div className="min-h-[100dvh] bg-slate-50">
        <Navbar session={session} />
        <main className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-slate-900">Post not found</h1>
          <Link className="mt-5 inline-block font-semibold text-indigo-700 underline underline-offset-4" to="/blogs">Back to All Posts</Link>
        </main>
      </div>
    );
  }
  const editable = canManagePost(post, session);

  function handleDelete() {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const result = deletePost(post.id, session);
    if (result.ok) {
      navigate('/blogs', { replace: true });
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-800">
      <Navbar session={session} />
      <main className="mx-auto max-w-4xl px-5 py-10 sm:py-16">
        <Link className="text-sm font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4" to="/blogs">← Back to All Posts</Link>
        <article className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-medium text-slate-500">{formatPostDate(post.createdAt)}</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">{post.title}</h1>
          <div className="mt-6 flex items-center gap-3 border-b border-slate-100 pb-6">
            <Avatar role={post.authorRole || (post.authorId === 'admin' ? 'admin' : 'user')} displayName={post.authorName} />
            <span className="font-medium text-slate-700">{post.authorName}</span>
          </div>
          <div className="whitespace-pre-wrap py-8 text-lg leading-8 text-slate-700">{post.content}</div>
          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            {editable ? <>
              <Link className="rounded-lg border border-indigo-200 px-4 py-2 font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600" to={`/edit/${encodeURIComponent(post.id)}`}>Edit</Link>
              <button className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600" type="button" onClick={handleDelete}>Delete</button>
            </> : <Link className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600" to="/blogs">Back to All Posts</Link>}
          </div>
        </article>
      </main>
    </div>
  );
}
