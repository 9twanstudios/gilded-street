import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
}

export function CountdownTimer({ targetDate, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.total <= 0) {
    return <span className={`text-primary font-display font-bold uppercase tracking-wider ${className}`}>Live Now!</span>;
  }

  return (
    <div className={`flex gap-3 ${className}`}>
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hrs" },
        { value: timeLeft.minutes, label: "Min" },
        { value: timeLeft.seconds, label: "Sec" },
      ].map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="bg-surface border border-border rounded-lg px-3 py-2 min-w-[3.5rem]">
            <span className="text-primary font-heading text-2xl">{String(unit.value).padStart(2, "0")}</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-display uppercase tracking-wider mt-1 block">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

function getTimeLeft(targetDate: string) {
  const total = new Date(targetDate).getTime() - Date.now();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}
