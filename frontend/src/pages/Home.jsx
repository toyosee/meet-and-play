import { useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaGamepad } from "react-icons/fa";
import { registerUser } from "../api/api";
import Countdown from "../component/Countdown";

function Home() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    interests: "",
    hobby: "",
    gamer: "No",
    gameType: "Video Games",
  });

  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const eventDate = new Date("2025-10-01T10:00:00");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await registerUser(form);
      setTicket(data);
    } catch (err) {
      console.error("Error registering:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col md:flex-row bg-black"
      style={{
        backgroundImage: "url('/game-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Greenish Overlay */}
      <div className="absolute inset-0 bg-green-950/80" />

      {/* Left Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-white p-8">
        <div className="z-10 text-center">
          <Countdown targetDate={eventDate} />
          <h1 className="text-4xl md:text-6xl font-extrabold text-green-400 mb-6 drop-shadow-lg">
            Barterverse <br /> Meet and Play
          </h1>
          <p className="text-lg text-gray-300 max-w-md mx-auto">
            Join innovators, thinkers, and coders to celebrate{" "}
            <span className="text-green-400 font-bold">
              The Independence Day
            </span>{" "}
            with an unforgettable gaming experience. Let's meet and play
          </p>
        </div>
      </div>

      {/* Right Section - Signup Form / Ticket */}
      <div className="relative flex-1 flex items-center justify-center m-5">
        {!ticket ? (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900/90 text-white p-8 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-md z-10"
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
              <FaGamepad className="inline mr-2" /> Register Now
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div className="flex items-center space-x-2">
                <FaUser />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-2">
                <FaPhone />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="flex items-center space-x-2">
                <FaEnvelope />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Address */}
              <input
                type="text"
                name="address"
                placeholder="Address"
                className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={handleChange}
              />

              {/* Interests */}
              <input
                type="text"
                name="interests"
                placeholder="Your Interests"
                className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={handleChange}
              />

              {/* Hobby */}
              <input
                type="text"
                name="hobby"
                placeholder="Your Hobby"
                className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={handleChange}
              />

              {/* Gamer Option */}
              <div>
                <label className="block mb-1 text-gray-300">
                  Are you a gamer?
                </label>
                <select
                  name="gamer"
                  className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={handleChange}
                >
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>

              {/* Game Type */}
              <div>
                <label className="block mb-1 text-gray-300">
                  <FaGamepad className="inline mr-2" /> Games You Like
                </label>
                <select
                  name="gameType"
                  className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={handleChange}
                >
                  <option>Video Games</option>
                  <option>Board Games</option>
                  <option>Critical Thinking Games</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-black font-bold rounded hover:from-green-400 hover:to-green-600 transition-transform transform hover:scale-105"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        ) : (
          // Updated Success Message Display
          <div className="bg-gray-900/90 text-white p-8 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-md z-10 text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-400">
              🎉 Registration Successful!
            </h2>
            <p className="mb-2">{ticket.message}</p>
            <p className="text-lg font-bold mb-4">
              Your Code: <span className="text-green-400">{ticket.code}</span>
            </p>
            <p className="text-sm text-gray-300">
              Please check your email for your digital ticket attachment. 📧
              <br />
              This ticket is <span className="text-red-400">non-transferable</span>
              and valid only on event day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;