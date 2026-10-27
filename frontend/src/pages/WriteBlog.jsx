import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getSession, getPosts } from '../utils/storage.js';
import { canManagePost, createPost, updatePost } from '../utils/posts.js';

/** Create or edit a post with required-field and ownership checks. */
export default function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const posts = useMemo(() => getPosts(), []);
  const existing = id ? posts.find((post) => post.id === id) : null;
  const canEdit = existing && canManagePost(existing, session);
  const [title, setTitle] = useState(existing?.title || '');
  const [content, setContent] = useState(existing?.content || '');
  const [errors, setErrors] = useState({});

  if (!session) return <Navigate to="/login" replace />;
  if (id && !canEdit) return <Navigate to="/blogs" replace />;

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Title is required.';
    if (!content.trim()) nextErrors.content = 'Content is required.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const result = existing
      ? updatePost(existing.id, { title, content }, session)
      : createPost({ title, content, session });
    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }
    navigate(`/blog/${encodeURIComponent(result.post.id)}`, { replace: true });
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-800">
      <Navbar session={session} />
      <main className="mx-auto max-w-4xl px-5 py-10 sm:py-16">
        <Link className="text-sm font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4" to="/blogs">← Back to All Posts</Link>
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10" aria-labelledby="write-heading">
          <p className="text-sm font-semibold text-indigo-700">Your writing space</p>
          <h1 id="write-heading" className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950">{existing ? 'Edit Post' : 'Write a New Post'}</h1>
          <p className="mt-3 text-slate-600">This demo saves your post only in this browser.</p>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="post-title">Title</label>
              <input className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-200" id="post-title" value={title} onChange={(event) => { setTitle(event.target.value); setErrors((current) => ({ ...current, title: '', form: '' })); }} aria-required="true" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'post-title-error' : undefined} />
              {errors.title && <p id="post-title-error" className="mt-1 text-sm text-red-700" role="alert">{errors.title}</p>}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-semibold text-slate-800" htmlFor="post-content">Content</label>
                <span className="text-sm tabular-nums text-slate-500" aria-live="polite">{content.length} characters</span>
              </div>
              <textarea className="min-h-64 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 leading-7 text-slate-900 outline-none focus-visible:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-200" id="post-content" value={content} onChange={(event) => { setContent(event.target.value); setErrors((current) => ({ ...current, content: '', form: '' })); }} aria-required="true" aria-invalid={Boolean(errors.content)} aria-describedby={errors.content ? 'post-content-error' : undefined} />
              {errors.content && <p id="post-content-error" className="mt-1 text-sm text-red-700" role="alert">{errors.content}</p>}
            </div>
            {errors.form && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{errors.form}</p>}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link className="rounded-lg px-5 py-3 text-center font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600" to={existing ? `/blog/${encodeURIComponent(existing.id)}` : '/blogs'}>Cancel</Link>
              <button className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" type="submit">{existing ? 'Save Changes' : 'Publish Post'}</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
