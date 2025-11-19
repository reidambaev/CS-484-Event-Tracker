import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Home</h1>
      <p>Welcome to the event tracker</p>
      <div className="mt-4">
        <Link to="/profile" className="text-blue-500 underline mr-4">
          Profile
        </Link>
        <Link to="/admin" className="text-blue-500 underline">
          Admin
        </Link>
      </div>
    </div>
  );
}

export default Home;
