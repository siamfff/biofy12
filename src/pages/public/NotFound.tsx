import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-4">
      <h1 className="text-5xl font-bold text-white font-display">404</h1>
      <p className="text-sm text-muted">This page doesn't exist.</p>
      <Link to="/dashboard"><Button>Go to Dashboard</Button></Link>
    </div>
  );
}