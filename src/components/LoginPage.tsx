import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // TODO: Implement real login logic here
    navigate('/', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <button
        onClick={handleLogin}
        className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark"
      >
        Log In
      </button>
    </div>
  );
};

export default LoginPage;
