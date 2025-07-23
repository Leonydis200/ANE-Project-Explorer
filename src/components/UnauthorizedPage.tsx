import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Unauthorized</h1>
      <p className="mb-6">You do not have permission to access this page.</p>
      <button
        onClick={() => navigate('/', { replace: true })}
        className="px-6 py-2 bg-secondary text-white rounded hover:bg-secondary-dark"
      >
        Go Home
      </button>
    </div>
  );
};

export default UnauthorizedPage;
