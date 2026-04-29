import { NavLink, Outlet } from 'react-router';

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <nav className="public-nav" aria-label="Public navigation">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Home
        </NavLink>
        <NavLink to="/register" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Register
        </NavLink>
      </nav>

      <section className="public-content">
        <Outlet />
      </section>
    </div>
  );
}
