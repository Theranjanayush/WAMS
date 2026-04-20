import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 border-t-8 border-indigo-600 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-zinc-100">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">WAMS Portal</h1>
          <p className="text-sm text-zinc-500 mt-2 font-medium">Log in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              placeholder="e.g. manager"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-xs text-zinc-400 font-medium">
            Web Based Automated Manufacturing System
          </p>
        </div>
      </div>
    </div>
  );
}
