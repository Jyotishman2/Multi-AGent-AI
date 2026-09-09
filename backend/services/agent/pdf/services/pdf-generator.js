import PDFDocument from "pdfkit";
import { z } from "zod";

import { getModel } from "../../config/llmModels.js";

export const pdfTemplateSchema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().max(120).optional(),
  sections: z
    .array(
      z.object({
        heading: z.string().min(1).max(200),
        body: z.string().min(1).max(20000),
      })
    )
    .min(1)
    .max(50),
});

const fallbackTemplate = (prompt) => ({
  title: "CortexAI Generated Document",
  author: "CortexAI",
  sections: [{ heading: "Content", body: prompt }],
});

export const createTemplate = async ({ prompt, template }) => {
  if (template) return pdfTemplateSchema.parse(template);
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    return fallbackTemplate(prompt);
  }

  const model = await getModel("coding");
  const structuredModel = model.withStructuredOutput(pdfTemplateSchema);
  return structuredModel.invoke(`
Create a professional PDF document model from this request.
Use concise headings and complete, readable prose.
Return only the structured document model.

Request:
${prompt}
`);
};

export const renderPdf = async (template) => {
  const document = new PDFDocument({ margin: 54, size: "A4" });
  const chunks = [];

  return new Promise((resolve, reject) => {
    document.on("data", (chunk) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    document.fontSize(24).font("Helvetica-Bold").text(template.title);
    if (template.author) {
      document
        .moveDown(0.5)
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#64748b")
        .text(`Prepared by ${template.author}`);
    }
    document.moveDown(1.5).fillColor("#111827");

    template.sections.forEach((section) => {
      document.fontSize(15).font("Helvetica-Bold").text(section.heading);
      document.moveDown(0.35).fontSize(10.5).font("Helvetica").text(section.body, {
        align: "left",
        lineGap: 4,
      });
      document.moveDown(1);
    });

    document.end();
  });
};
