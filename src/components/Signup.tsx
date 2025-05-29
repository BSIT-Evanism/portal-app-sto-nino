import { authClient } from "@/lib/auth-client";
import { useState } from 'react';

interface SignUpProps {
  onBack?: () => void;
}

export default function SignUp({ onBack }: SignUpProps) {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState("");

  const signUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const name = `${firstName} ${middleName} ${lastName}`.replace(/ +/g, ' ').trim();
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name
    }, {
      onRequest: (ctx) => {
        //show loading
      },
      onSuccess: (ctx) => {
        //redirect to the dashboard
        window.location.href = "/";
      },
      onError: (ctx) => {
        setError(ctx.error.message || "An error occurred")
      },
    });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="relative w-full h-auto max-w-4xl max-h-[90vh] bg-gray-50 rounded-2xl flex flex-col overflow-hidden">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8 pt-20">
          <div className="w-full max-w-3xl mx-auto p-8 bg-[#e6e6e6] rounded-2xl flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-green-700 text-center mb-6">Registration</h1>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block mb-1 text-sm">Enter First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Enter Middle Name</label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={e => setMiddleName(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Enter Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Enter Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Enter Mobile Number</label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 justify-center">
                <div>
                  <label className="block mb-1 text-sm">Enter Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 mt-3 text-center text-sm">{error}</p>}
            <div className="flex justify-end mt-6">
              <button
                onClick={signUp}
                className="flex items-center gap-2 px-8 py-2 bg-green-700 text-white text-xl rounded-full hover:bg-green-800 focus:outline-none"
              >
                Register
                <span className="ml-2 text-2xl">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}