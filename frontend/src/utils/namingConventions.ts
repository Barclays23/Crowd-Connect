// frontend/src/utils/namingConventions.ts

// eg: "user name" -> "User name"
export const capitalize = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
}


// eg: "this is the title" -> "This Is The Title"
export const toTitleCase = (value: string) => {
    return value
    //   .replace(/[_-]/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase());
}



// eg: "John Doe" -> "JD"
export const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};




// john.doe@gmail.com  →  joh****@gmail.com
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "Not Provided";
  
  const [localPart, domain] = email.split("@");
  if (!domain) return email; // invalid email

  // Show first 2–3 chars, hide the rest of local part
  let maskedLocal = localPart;
  
  if (localPart.length <= 4) {
    maskedLocal = localPart[0] + "***";
  } else if (localPart.length <= 7) {
    maskedLocal = localPart.slice(0, 2) + "***" + localPart.slice(-1);
  } else {
    maskedLocal = localPart.slice(0, 3) + "****" + localPart.slice(-2);
  }

  return `${maskedLocal}@${domain}`;
}
