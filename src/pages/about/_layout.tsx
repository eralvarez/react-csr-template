import { Outlet } from 'react-router';

export default function App() {
  return (
    <div>
      <header>
        <span style={{ backgroundColor: 'lightblue' }}>about layout</span>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
