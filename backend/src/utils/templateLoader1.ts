// src/utils/templateLoader1.ts
import * as fs from "fs/promises";
import * as path from "path";
import Handlebars from "handlebars";
import { 
  EmailTemplate, 
  TemplatePayloadMap 
} from "../types/email.types";


// load the html template with handlebars
export async function renderTemplateWithHandleBars<K extends EmailTemplate>(
  templateName: K,
  templatePayload: TemplatePayloadMap[K]
): Promise<string> {
  const templatePath = path.join(__dirname, "../templates", templateName);

  try {
    const htmlContent = await fs.readFile(templatePath, { encoding: "utf-8" });
    const compiledTemplate = Handlebars.compile(htmlContent);
    
    return compiledTemplate(templatePayload);
    
  } catch (error: unknown) {
    console.error(`Error loading template ${templateName}:`, error);
    throw new Error(`Failed to load email template: ${templateName}`);
  }
}




// export async function renderTemplateWithHandleBars(
//   templateName: string,
//   templateData: Record<string, string | number | boolean>
// ): Promise<string> {
//   const templatePath = path.join(__dirname, "../templates", templateName);

//   try {
//     const htmlContent = await fs.readFile(templatePath, { encoding: "utf-8" });
//     const compiledTemplate = Handlebars.compile(htmlContent);
//     return compiledTemplate(templateData);

//   } catch (error: unknown) {
//     console.error(`Error loading template ${templateName}:`, error);
//     throw new Error(`Failed to load email template: ${templateName}`);
//   }
// }