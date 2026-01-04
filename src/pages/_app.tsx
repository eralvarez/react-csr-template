import { Outlet } from 'react-router';

export default function App() {
  return (
    <div>
      <header>
        <h1>My App</h1>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>&copy; 2026 My App</p>
      </footer>
    </div>
  );
}
