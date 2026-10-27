import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import BlogCard from '../components/BlogCard.jsx';
import { getSession, getPosts } from '../utils/storage.js';
import { sortPostsNewest } from '../utils/posts.js';

/** List every locally stored post with role-aware editing controls. */
export default function Home() {
  const session = getSession();
  const [posts] = useState(() => sortPostsNewest(getPosts()));

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-800">
      <Navbar session={session} />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-indigo-700">The community</p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-slate-950">All Blogs</h1>
            <p className="mt-3 text-slate-600">Read what people in this space have been thinking about.</p>
          </div>
          <Link className="rounded-full bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to="/write">Write a Post</Link>
        </div>
        {posts.length ? (
          <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => <BlogCard key={post.id} post={post} index={index} session={session} />)}
          </div>
        ) : (
          <section className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center" aria-labelledby="empty-blogs-heading">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-2xl text-indigo-700" aria-hidden="true">✎</span>
            <h2 id="empty-blogs-heading" className="mt-5 font-display text-2xl font-bold text-slate-900">No blogs yet. Be the first to write one!</h2>
            <Link className="mt-6 inline-flex rounded-full bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to="/write">Write your first post</Link>
          </section>
        )}
      </main>
    </div>
  );
}
