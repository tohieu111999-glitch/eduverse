"use client";

import { useEffect, useRef, useState } from "react";
import { recordOnlineTimeAction } from "./quest-actions";

export function OnlineTimer() {
  const [minutes, setMinutes] = useState(0);
  const reportedMinutesRef = useRef(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 60000);
      setMinutes(elapsed);

      // Report online time every minute, up to 15
      if (elapsed > reportedMinutesRef.current && elapsed <= 15) {
        reportedMinutesRef.current = elapsed;
        recordOnlineTimeAction(elapsed);
      }
    }, 30000); // check every 30s
    return () => clearInterval(id);
  }, []);

  if (minutes === 0) return <span>Bạn vừa online</span>;
  return <span>Bạn đã online {minutes} phút</span>;
}
