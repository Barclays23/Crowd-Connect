
export function generateRandomPassword(passwordLength: number = 8): string {
   const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
   const lower = "abcdefghijklmnopqrstuvwxyz";
   const numbers = "0123456789";
   const special = "!@#$%^&*";

   const all = upper + lower + numbers + special;

   // Ensure at least one from each category
   const requiredChars = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      special[Math.floor(Math.random() * special.length)],
   ];

   // Fill remaining length
   const remainingLength = passwordLength - requiredChars.length;
   for (let i = 0; i < remainingLength; i++) {
      requiredChars.push(
         all[Math.floor(Math.random() * all.length)]
      );
   }

   // Shuffle to avoid predictable positions
   for (let i = requiredChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]];
   }

   const generatedPassword = requiredChars.join("");
   return generatedPassword;
}
