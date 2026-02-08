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
