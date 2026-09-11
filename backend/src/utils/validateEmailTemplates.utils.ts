// src/utils/validateEmailTemplates.utils.ts
import * as fs from "fs/promises";
import * as path from "path";
import { EmailTemplate } from "@/types/email.types";



// Call this once at server startup (e.g. right after your DB connection, before app.listen()).
// Fails fast and loud if a template file is missing or was renamed without updating the enum,
// instead of failing silently the first time that specific email type is triggered in production.
export async function validateEmailTemplatesExist(): Promise<void> {
    const templatesDir = path.join(__dirname, "../templates");
    const missing: string[] = [];

    for (const fileName of Object.values(EmailTemplate)) {
        try {
            await fs.access(path.join(templatesDir, fileName));
        } catch {
            missing.push(fileName);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `[Email Templates] Missing file(s): ${missing.join(", ")}. ` +
            `Check for typos between the EmailTemplate enum values and the actual filenames in src/templates/.`
        );
    }

    console.log(`[Email Templates] All ${Object.values(EmailTemplate).length} template files verified.`);
}