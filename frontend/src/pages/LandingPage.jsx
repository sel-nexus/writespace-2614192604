import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { getPosts, getSession } from '../utils/storage.js';

/** Introduce WriteSpace and let visitors explore locally saved writing. */
export default function LandingPage() {
  const navigate = useNavigate();
  const session = getSession();
  const latestPosts = getPosts()
    .filter((post) => post && typeof post.title === 'string' && typeof post.createdAt === 'string')
    .map((post) => ({ ...post, content: typeof post.content === 'string' ? post.content : '' }))
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .slice(0, 3);

  function openPost(postId) {
    if (session) {
      navigate(`/blog/${encodeURIComponent(postId)}`);
      return;
    }
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PublicNavbar session={session} />
      <main>
        <section className="relative overflow-hidden border-b border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
          <div className="mx-auto grid min-h-[620px] max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-20">
            <div className="relative z-10 max-w-2xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">A little room for your words</p>
              <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Your thoughts. Your space.
                <span className="mt-2 block text-indigo-700">Beautifully simple.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Write what matters, then make time for the ideas others share.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link className="rounded-full bg-indigo-600 px-7 py-3.5 font-semibold text-white shadow-md shadow-indigo-200 transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to={session ? '/blogs' : '/login'}>
                  Start Reading
                </Link>
                <Link className="rounded-full border border-indigo-200 bg-white px-7 py-3.5 font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to="/register">
                  Get Started Free
                </Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md" aria-label="A preview of the WriteSpace reading experience">
              <div className="absolute -right-6 -top-8 h-36 w-36 rounded-full bg-pink-200/70 blur-3xl" aria-hidden="true" />
              <article className="relative -rotate-2 rounded-3xl border border-white bg-white p-7 shadow-2xl shadow-indigo-200/70 transition-transform duration-300 hover:rotate-0 motion-reduce:transition-none">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <span className="font-display text-lg font-bold text-slate-900">WriteSpace</span>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">A quiet place to write</span>
                </div>
                <div className="py-7">
                  <p className="text-sm font-semibold text-indigo-700">A note to begin</p>
                  <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-slate-900">Small thoughts deserve space.</h2>
                  <p className="mt-4 leading-7 text-slate-600">Make a page your own, keep your words close, and read at your own pace.</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-5 text-sm text-slate-500">
                  <span>Plain text, no distractions</span>
                  <span aria-hidden="true">↗</span>
                </div>
              </article>
              <p className="relative mt-5 text-center text-sm text-slate-500">A simple space for reading and writing</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20" aria-labelledby="features-heading">
          <div className="max-w-2xl">
            <h2 id="features-heading" className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">More room for the words that matter.</h2>
            <p className="mt-4 text-lg leading-7 text-slate-600">A straightforward writing space, ready whenever an idea arrives.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
              <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 text-indigo-700" aria-hidden="true">✎</span>
              <h3 className="font-display text-xl font-bold text-slate-900">Write Freely</h3>
              <p className="mt-2 leading-6 text-slate-600">Plain-text writing keeps the focus on your thoughts.</p>
            </article>
            <article className="rounded-2xl border border-violet-100 bg-violet-50/70 p-6 shadow-sm">
              <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-violet-100 text-violet-700" aria-hidden="true">⌂</span>
              <h3 className="font-display text-xl font-bold text-slate-900">Private &amp; Local</h3>
              <p className="mt-2 leading-6 text-slate-600">Your demo data stays in this browser.</p>
            </article>
            <article className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
              <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-teal-100 text-teal-800" aria-hidden="true">↗</span>
              <h3 className="font-display text-xl font-bold text-slate-900">Instant &amp; Fast</h3>
              <p className="mt-2 leading-6 text-slate-600">Open your writing without waiting for a server.</p>
            </article>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white" aria-labelledby="latest-heading">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 id="latest-heading" className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Latest from the Blog</h2>
                <p className="mt-3 text-slate-600">A few recent pieces from this local writing space.</p>
              </div>
              <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-900" to={session ? '/blogs' : '/login'}>All Blogs</Link>
            </div>
            {latestPosts.length ? (
              <div className="mt-9 grid gap-5 md:grid-cols-3">
                {latestPosts.map((post, index) => (
                  <button key={post.id || `${post.title}-${index}`} className="group rounded-2xl border border-slate-200 border-t-4 border-t-indigo-500 bg-white p-6 text-left shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" onClick={() => openPost(post.id)}>
                    <span className="text-sm font-medium text-slate-500">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                    <h3 className="mt-3 font-display text-xl font-bold text-slate-900 group-hover:text-indigo-700">{post.title}</h3>
                    <p className="mt-3 leading-6 text-slate-600">{post.content.slice(0, 120)}{post.content.length > 120 ? '…' : ''}</p>
                    <span className="mt-5 inline-block text-sm font-semibold text-indigo-700">Read post <span aria-hidden="true">→</span></span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-9 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-600">No posts yet - check back soon!</p>
            )}
          </div>
        </section>
      </main>
      <footer className="bg-slate-900 text-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link className="font-display text-xl font-bold text-white" to="/">WriteSpace</Link>
            <p className="mt-2 text-sm text-slate-400">Your thoughts, your space.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm" aria-label="Footer navigation">
            <Link className="hover:text-white" to="/">Home</Link>
            <Link className="hover:text-white" to={session ? '/blogs' : '/login'}>All Blogs</Link>
            <Link className="hover:text-white" to="/login">Login</Link>
            <Link className="hover:text-white" to="/register">Register</Link>
          </nav>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} WriteSpace</p>
        </div>
      </footer>
    </div>
  );
}
