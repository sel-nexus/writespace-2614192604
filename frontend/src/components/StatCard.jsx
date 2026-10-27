import PropTypes from 'prop-types';

/** Present one administrator dashboard metric with a clear text label. */
export default function StatCard({ label, value, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-800 ring-indigo-100',
    violet: 'bg-violet-50 text-violet-800 ring-violet-100',
    pink: 'bg-pink-50 text-pink-800 ring-pink-100',
    teal: 'bg-teal-50 text-teal-900 ring-teal-100',
  };
  return (
    <article className={`rounded-2xl p-5 ring-1 ${tones[tone] || tones.indigo}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-3 font-display text-4xl font-bold tabular-nums" aria-label={`${value} ${label}`}>{value}</p>
    </article>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  tone: PropTypes.oneOf(['indigo', 'violet', 'pink', 'teal']),
};
