// src/utils/templateLoader2.ts

import * as fs from "fs/promises";
import * as path from "path";

/**
 * Dynamically loads an HTML template and renders it with provided data.
 * @param templateName The name of the template file (e.g., 'otpEmail' || 'otpEmail.html').
 * @param templateData An object containing the data to substitute into the template.
 * @returns The fully rendered HTML string.
 */
export async function renderTemplate(
  templateName: string,
  templateData: Record<string, string | number | boolean>
): Promise<string> {
  // Construct the absolute path to the template file
  // Assuming templates are in 'src/templates/' and this utility is in 'src/utils/'
  const templatePath = path.join(__dirname,"../templates",`${templateName}`
  );

  let htmlContent: string;

  try {
    // Read the HTML file content asynchronously
    htmlContent = await fs.readFile(templatePath, { encoding: "utf-8" });
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    // You must handle the case where the template file doesn't exist
    throw new Error(`Failed to load email template: ${templateName}`);
  }

  // Simple placeholder replacement logic (e.g., replaces {{OTP_CODE}} with templateData.otpCode)
  let finalHtml = htmlContent;

  for (const key in templateData) {
    if (Object.prototype.hasOwnProperty.call(templateData, key)) {
      // Create the placeholder format, e.g., '{{USER_NAME}}', '{{OTP_CODE}}' etc
      const placeholder = new RegExp(`{{${key.toUpperCase()}}}`, "g"); 
      finalHtml = finalHtml.replace(placeholder, String(templateData[key]));
    }
  }

  return finalHtml;
}