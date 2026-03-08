// frontend/src/utils/dateAndTimeFormats.ts


// Format date as "Month Day, Year" (e.g., "January 1, 2023")
export function formatDate1(date: string | Date, locale: string = "en-US"): string {
   if (!date) return "—"; // Fallback if date is missing

   const dateObj = typeof date === "string" ? new Date(date) : date;

   // Safety check for invalid dates
   if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
   }

   return dateObj.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
   });
}




// Format date as "DD-MM-YYYY" (e.g., "01-01-2023")
export function formatDate2(date: string | Date): string {
   if (!date) return "—"; // Fallback if date is missing
   const dateObj = typeof date === "string" ? new Date(date) : date;
   // Safety check for invalid dates
   if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
   }
   const day = String(dateObj.getDate()).padStart(2, '0');
   const month = String(dateObj.getMonth() + 1).padStart(2, '0');
   const year = dateObj.getFullYear();

   return `${day}-${month}-${year}`;
}



export function formatDate3(iso: string) {
   return new Date(iso).toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
   });
}



export function formatDate4(dateStr: string, opts?: Intl.DateTimeFormatOptions) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
        ...opts,
    });
}



// Formats a date to "DD-MM-YYYY HH:mm" (24-hour format)
// Example: "13-07-2026 22:00"
export function formatDate5(date: string | Date | number | null | undefined): string {
   if (!date) return "—";

   const dateObj = typeof date === 'number' 
      ? new Date(date) 
      : typeof date === 'string' 
         ? new Date(date) 
         : date;

   if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
   }

   const pad = (n: number) => String(n).padStart(2, '0');

   const day   = pad(dateObj.getDate());
   const month = pad(dateObj.getMonth() + 1);
   const year  = dateObj.getFullYear();
   const hours = pad(dateObj.getHours());
   const minutes = pad(dateObj.getMinutes());

   return `${day}-${month}-${year} ${hours}:${minutes}`;
}



//  Examples:
//  "Monday, 13 July 2026 22:00"
export function formatDate6(
   date: string | Date | number | null | undefined,
   locale: string = "en-IN"
): string {
   if (!date) return "—";

   const dateObj = typeof date === "number"
      ? new Date(date)
      : typeof date === "string"
         ? new Date(date)
         : date;

   if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
   }

   return dateObj.toLocaleDateString(locale, {
      weekday: "long",           // Monday
      day: "numeric",            // 13
      month: "long",             // July
      year: "numeric",           // 2026
   }) + " " + dateObj.toLocaleTimeString(locale, {
      hour: "2-digit",           // 22 or 14
      minute: "2-digit",         // 00 or 30
      hour12: false,             // Force 24-hour format
   });
}


// expected parameter format: date = "YYYY-MM-DD", time = "HH:mm"
export const parseISODateTime = (date: string, time: string) => {
   const [yyyy, mm, dd] = date.split("-");

   return new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(time.split(":")[0]),
      Number(time.split(":")[1])
   );
};





export const parseISODateTime2 = (date?: string, time?: string) => {
  if (!date || !time) return new Date(NaN);

  return new Date(`${date}T${time}:00`);
};





//  Splits a Date or ISO string into local-timezone date + time strings
//  suitable for <input type="date"> and <input type="time"> fields.
//  @returns { date: "YYYY-MM-DD", time: "HH:mm" }
//  @example
//  toLocalInputDateTime("2026-02-28T04:08:00.000Z")
// In IST (UTC+5:30) → { date: "2026-02-28", time: "09:38" }
export function toLocalInputDateTime(value: string | Date): { date: string; time: string } {
   const d = typeof value === "string" ? new Date(value) : value;

   if (isNaN(d.getTime())) {
      return { date: "", time: "" };
   }

   const pad = (n: number) => String(n).padStart(2, "0");

   const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
   const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

   return { date, time };
}







export interface EventDuration {
   text: string;
   isValid: boolean;
   days: number;
   hours: number;
   minutes: number;
}

export const calculateEventDuration = (start: Date | string, end: Date | string): EventDuration | null => {
   const startDate = new Date(start);
   const endDate = new Date(end);

   // Return null if dates are incomplete or invalid
   if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return null;
   }

   const diffMs = endDate.getTime() - startDate.getTime();

   // Handle past or identical end times
   if (diffMs <= 0) {
      return {
         text: "0 mins (Invalid Time)",
         isValid: false,
         days: 0,
         hours: 0,
         minutes: 0,
      };
   }

   const diffMins = Math.floor(diffMs / (1000 * 60));
   const days = Math.floor(diffMins / (60 * 24));
   const hours = Math.floor((diffMins % (60 * 24)) / 60);
   const minutes = diffMins % 60;

   const parts = [];
   if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
   if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
   if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);

   return {
      text: parts.join(', '),
      isValid: true,
      days,
      hours,
      minutes,
   };
};
