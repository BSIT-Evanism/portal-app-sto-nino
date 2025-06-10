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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="relative w-full max-w-full mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-sm md:text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Main Content */}
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8 bg-[#e6e6e6] rounded-2xl">
          <h1 className="text-2xl md:text-4xl font-bold text-green-700 text-center mb-4 md:mb-6">Registration</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="flex flex-col gap-3 md:gap-4">
              <div>
                <label className="block mb-1 text-sm md:text-base">Enter First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 md:py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm md:text-base">Enter Middle Name</label>
                <input
                  type="text"
                  value={middleName}
                  onChange={e => setMiddleName(e.target.value)}
                  className="w-full px-3 py-2 md:py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm md:text-base">Enter Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-3 py-2 md:py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm md:text-base"
                />
              </div>
              <div className="lg:hidden">
                <label className="block mb-1 text-sm md:text-base">Enter Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 md:py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm md:text-base"
                />
              </div>
              <div className="lg:hidden">
                <label className="block mb-1 text-sm md:text-base">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 md:py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm md:text-base"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 md:gap-4 lg:justify-center">
              <div>
                <label className="block mb-1 text-sm md:text-base">Enter Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 md:py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm md:text-base">Enter Mobile Number</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full px-3 py-2 md:py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm md:text-base"
                />
              </div>
              <div className="hidden lg:block">
                <label className="block mb-1 text-sm md:text-base">Enter Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 md:py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm md:text-base"
                />
              </div>
              <div className="hidden lg:block">
                <label className="block mb-1 text-sm md:text-base">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 md:py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none text-sm md:text-base"
                />
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 mt-3 text-center text-sm md:text-base">{error}</p>}
          <div className="flex justify-center lg:justify-end mt-4 md:mt-6">
            <button
              onClick={signUp}
              className="flex items-center gap-2 px-6 md:px-8 py-2 md:py-3 bg-green-700 text-white text-lg md:text-xl rounded-full hover:bg-green-800 focus:outline-none w-full lg:w-auto justify-center lg:justify-start"
            >
              Register
              <span className="ml-2 text-xl md:text-2xl">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}