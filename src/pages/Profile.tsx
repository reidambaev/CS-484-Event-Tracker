import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../utils/supabase";

function Profile() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Profile</h1>
      {user ? (
        <div>
          <p>Email: {user.email}</p>
          <p className="mt-2">ID: {user.id}</p>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
      <Link to="/" className="text-blue-500 underline mt-4 block">
        Back to Home
      </Link>
    </div>
  );
}

export default Profile;
