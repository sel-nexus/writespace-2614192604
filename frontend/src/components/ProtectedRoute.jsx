import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/storage.js';
import { isValidSession } from '../utils/auth.js';

/** Guard a page against missing sessions or roles that lack permission. */
export default function ProtectedRoute({ children, role }) {
  const session = getSession();
  if (!isValidSession(session)) {
    return <Navigate to="/login" replace />;
  }
  if (role && session.role !== role) {
    return <Navigate to="/blogs" replace />;
  }
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.oneOf(['admin', 'user']),
};
