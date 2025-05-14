import { authClient } from "@/lib/auth-client";
import { useState } from 'react';

export default function SignUp() {
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
      },
      onError: (ctx) => {
        setError(ctx.error.message || "An error occurred")
      },
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-[#e6e6e6] rounded-2xl flex flex-col justify-center">
      <h1 className="text-5xl font-bold text-green-700 text-center mb-10">Registration</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-1">Enter First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block mb-1">Enter Middle Name</label>
            <input
              type="text"
              value={middleName}
              onChange={e => setMiddleName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block mb-1">Enter Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block mb-1">Enter Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block mb-1">Enter Mobile Number</label>
            <input
              type="text"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              className="w-full px-4 py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 justify-end">
          <div>
            <label className="block mb-1">Enter Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none"
            />
          </div>
          <div>
            <label className="block mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-green-700 bg-[#e6e6e6] rounded focus:outline-none"
            />
          </div>
        </div>
      </div>
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      <div className="flex justify-end mt-8">
        <button
          onClick={signUp}
          className="flex items-center gap-2 px-10 py-3 bg-green-700 text-white text-2xl rounded-full hover:bg-green-800 focus:outline-none"
        >
          Register
          <span className="ml-2 text-3xl">→</span>
        </button>
      </div>
    </div>
  );
}