import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { canManagePost, formatPostDate, getExcerpt } from '../utils/posts.js';

const accents = ['border-indigo-500', 'border-violet-500', 'border-pink-500', 'border-teal-500'];

/** Render a post preview with author details and role-permitted edit access. */
export default function BlogCard({ post, index, session }) {
  const editable = canManagePost(post, session);
  const excerpt = getExcerpt(post.content, 120);
  const accent = accents[index % accents.length];

  return (
    <article className={`relative rounded-2xl border border-slate-200 border-t-4 ${accent} bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg`}>
      {editable && <Link className="absolute right-4 top-4 rounded-lg p-2 text-indigo-700 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600" to={`/edit/${encodeURIComponent(post.id)}`} aria-label={`Edit ${post.title}`}><span aria-hidden="true">✎</span></Link>}
      <Link className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" to={`/blog/${encodeURIComponent(post.id)}`}>
        <p className="text-sm font-medium text-slate-500">{formatPostDate(post.createdAt)}</p>
        <h2 className="mt-3 pr-8 font-display text-xl font-bold text-slate-900">{post.title}</h2>
        <p className="mt-3 min-h-12 leading-6 text-slate-600">{excerpt}</p>
      </Link>
      <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
        <Avatar role={post.authorRole || (post.authorId === 'admin' ? 'admin' : 'user')} displayName={post.authorName} />
        <span className="text-sm font-medium text-slate-700">{post.authorName}</span>
      </div>
    </article>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({ id: PropTypes.string.isRequired, title: PropTypes.string.isRequired, content: PropTypes.string.isRequired, createdAt: PropTypes.string.isRequired, authorId: PropTypes.string.isRequired, authorName: PropTypes.string.isRequired }).isRequired,
  index: PropTypes.number.isRequired,
  session: PropTypes.shape({ userId: PropTypes.string.isRequired, role: PropTypes.oneOf(['admin', 'user']).isRequired }).isRequired,
};
