import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BlogCard from '../components/BlogCard.jsx';
import StatCard from '../components/StatCard.jsx';
import { getPosts, getSession, getUsers } from '../utils/storage.js';
import { getDashboardStats, getRecentPosts } from '../utils/admin.js';
import { deletePost } from '../utils/posts.js';

/** Summarize local writing activity and surface recent admin post actions. */
export default function AdminDashboard() {
  const session = getSession();
  const [posts, setPosts] = useState(() => getPosts());
  const users = getUsers();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== 'admin') return <Navigate to="/blogs" replace />;
  const stats = getDashboardStats(posts, users);
  const recent = getRecentPosts(posts);

  function handleDelete(post) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const result = deletePost(post.id, session);
    if (result.ok) setPosts((current) => current.filter((entry) => entry.id !== post.id));
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-800">
      <Navbar session={session} />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 to-indigo-700 px-6 py-8 text-white shadow-lg shadow-indigo-200 sm:px-10 sm:py-10" aria-labelledby="admin-heading">
          <p className="text-sm font-semibold text-indigo-100">WriteSpace overview</p>
          <h1 id="admin-heading" className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Good to see you, {session.displayName}.</h1>
          <p className="mt-3 max-w-xl leading-6 text-indigo-100">A clear view of the writing and accounts in this local demo.</p>
        </section>
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Site statistics">
          <StatCard label="Total Posts" value={stats.totalPosts} tone="indigo" />
          <StatCard label="Total Users" value={stats.totalUsers} tone="violet" />
          <StatCard label="Total Admins" value={stats.totalAdmins} tone="pink" />
          <StatCard label="User-authored Posts" value={stats.userAuthoredPosts} tone="teal" />
        </section>
        <section className="mt-8 flex flex-wrap gap-3" aria-label="Quick actions">
          <Link className="rounded-full bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to="/write">Write New Post</Link>
          <Link className="rounded-full border border-indigo-200 bg-white px-5 py-3 font-semibold text-indigo-800 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to="/users">Manage Users</Link>
        </section>
        <section className="mt-12" aria-labelledby="recent-posts-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-indigo-700">Latest activity</p>
              <h2 id="recent-posts-heading" className="mt-1 font-display text-2xl font-bold text-slate-950">Recent Posts</h2>
            </div>
            <Link className="text-sm font-semibold text-indigo-700 underline underline-offset-4" to="/blogs">View all posts</Link>
          </div>
          {recent.length ? <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{recent.map((post, index) => <div key={post.id}><BlogCard post={post} index={index} session={session} /><button className="mt-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600" type="button" onClick={() => handleDelete(post)}>Delete {post.title}</button></div>)}</div> : <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-slate-600">No posts yet. Create the first one for this local space.</p>}
        </section>
      </main>
    </div>
  );
}
