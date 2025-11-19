import { Link } from "react-router-dom";

function Admin() {
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Admin Panel</h1>
      <p>Admin stuff goes here</p>
      <Link to="/" className="text-blue-500 underline mt-4 block">
        Back to Home
      </Link>
    </div>
  );
}

export default Admin;
