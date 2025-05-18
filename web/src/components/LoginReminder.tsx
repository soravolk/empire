import React from "react";

const LoginReminder: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
        <p className="text-gray-600 mb-6">
          You need to be logged in to access this content.
        </p>
        <a
          href="auth/google"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Log in with Google
        </a>
      </div>
    </div>
  );
};

export default LoginReminder;
