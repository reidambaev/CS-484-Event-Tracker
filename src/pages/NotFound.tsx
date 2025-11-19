import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">404 - Page Not Found</h1>
      <p>The page you're looking for does not exist.</p>
      <Link to="/" className="text-blue-500 underline mt-4 block">
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
