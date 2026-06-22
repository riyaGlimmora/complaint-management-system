// src/components/layout/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isAdmin, isManager, isInternal } from '../../utils/roleHelpers';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="navbar">
      <Link to="/" className="brand">CMS</Link>

      <nav>
        <Link to="/tickets">Tickets</Link>

        {/* Customer: create new complaint */}
        {user.role === 'customer' && <Link to="/tickets/new">New Complaint</Link>}

        {/* Internal roles: admin pages */}
        {isAdmin(user.role) && <Link to="/products">Products</Link>}
        {isAdmin(user.role) && <Link to="/teams">Teams</Link>}
        {isAdmin(user.role) && <Link to="/users">Users</Link>}

        {/* Dashboard links vary by role */}
        {isInternal(user.role) && (
          <Link to={
            isAdmin(user.role) || isManager(user.role)
              ? '/dashboard/products'
              : `/dashboard/staff/${user.id}`
          }>
            Dashboard
          </Link>
        )}

        <span className="user-pill">{user.name} ({user.role})</span>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Sign out
        </button>
      </nav>
    </header>
  );
}
