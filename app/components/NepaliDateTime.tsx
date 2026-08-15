"use client";

import { useEffect, useState } from "react";
import NepaliDate from "bikram-sambat-js";
// import { CalendarDays, Clock4 } from "lucide-react";
// import Clock from "./Clock";

// Nepali digits
const toNepaliDigits = (num: number | string) => {
  const nepali = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return num.toString().replace(/\d/g, (d) => nepali[parseInt(d)]);
};

const nepaliWeekdays = [
  "आइतवार",
  "सोमवार",
  "मङ्गलवार",
  "बुधवार",
  "बिहिवार",
  "शुक्रवार",
  "शनिवार",
];

const nepaliMonths = [
  "बैशाख",
  "जेठ",
  "असार",
  "श्रावण",
  "भदौ",
  "आश्विन",
  "कार्तिक",
  "मंसिर",
  "पौष",
  "माघ",
  "फाल्गुण",
  "चैत्र",
];

export default function NepaliClock() {
  const [time, setTime] = useState({
    hours: "",
    minutes: "",
    seconds: "",
    weekday: "",
    day: "",
    month: "",
    year: "",
  });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      const hours = toNepaliDigits(now.getHours().toString().padStart(2, "0"));
      const minutes = toNepaliDigits(
        now.getMinutes().toString().padStart(2, "0")
      );
      const seconds = toNepaliDigits(
        now.getSeconds().toString().padStart(2, "0")
      );

      const bsDate = new NepaliDate(now);
      const bsDateString = bsDate.toBS(); 
      const [bsYear, bsMonth, bsDay] = bsDateString.split("-").map(Number);
      const weekday = nepaliWeekdays[now.getDay()];
      const day = toNepaliDigits(bsDay);
      const month = nepaliMonths[bsMonth - 1]; 
      const year = toNepaliDigits(bsYear);

      setTime({ hours, minutes, seconds, weekday, day, month, year });
    };

    updateClock(); 
    const interval = setInterval(updateClock, 1000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center  pl-2 md:pl-4 lg:pl-6 text-sm sm:text-sm md:text-base lg:text-base xl:text-md">
      {/* Date Section */}
      <div className="flex gap-2 items-center text-gray-800">
        {/* <CalendarDays size={16} className="sm:w-18 sm:h-18 md:w-20 md:h-20" /> */}
        <span>{time.weekday},</span>
      </div>

      {/* Clock Component */}
      <div className=" text-gray-600 flex flex-row gap-2 md:gap-2 items-center  ">
        <span>
      {time.day},{time.month},{time.year} 
        </span>
        <span className="flex items-center gap-2  w-[120px] text-gray-600">
       {time.hours}:{time.minutes}:{time.seconds}
        </span>
        {/* <Clock4 size={18}/>  */}
      </div>
    </div>
  );
}
