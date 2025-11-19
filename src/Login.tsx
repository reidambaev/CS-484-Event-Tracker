import { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "./utils/supabase";

function Login() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Login</h1>
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? "Loading..." : "Login with Google"}
      </button>
      <div className="mt-4">
        <Link to="/" className="text-blue-500 underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Login;
