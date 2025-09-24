import { useEffect, useState } from "react";

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date("2025-10-01T10:00:00"); // October 1st, 10 AM
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-4xl font-bold text-green-400 drop-shadow-[0_0_10px_rgba(0,255,0,0.7)] text-center mb-6">
      {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
    </div>
  );
}

export default Countdown;
