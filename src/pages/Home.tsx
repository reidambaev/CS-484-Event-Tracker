import { Link } from "react-router-dom";
import { useState } from "react";
import CreateEventModal from "../components/CreateEventModal";

function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Home</h1>
      <p>Welcome to the event tracker</p>

      <button
        onClick={() => setShowModal(true)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Create Event
      </button>

      <div className="mt-4">
        <Link to="/profile" className="text-blue-500 underline mr-4">
          Profile
        </Link>
        <Link to="/admin" className="text-blue-500 underline">
          Admin
        </Link>
      </div>

      <CreateEventModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

export default Home;
