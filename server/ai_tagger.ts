import { invokeLLM } from "./_core/llm";

/**
 * AI-powered document tagging and classification service
 */

export interface DocumentTags {
  documentType: string;
  topics: string[];
  categories: string[];
  geographicFocus: string[];
  targetAudience: string;
  organizations: string[];
  extractedDates: string[];
  summary: string;
}

export async function analyzeDocument(
  fileName: string,
  content: string
): Promise<DocumentTags> {
  // Truncate content if too long (keep first 8000 chars for analysis)
  const truncatedContent = content.length > 8000 ? content.substring(0, 8000) + "..." : content;

  const prompt = `Analyze the following document and extract structured metadata.

Document Name: ${fileName}
Content:
${truncatedContent}

Please analyze this document and provide:
1. Document Type (e.g., pitch_deck, strategy_document, proposal, competition_submission, financial_model, marketing_material, research_document, technical_specification, email_template, presentation, report, contract, invoice, etc.)
2. Main Topics (3-5 key topics covered)
3. Categories (business categories like: investors, partnerships, marketing, technical, architecture, health, real_estate, construction, etc.)
4. Geographic Focus (countries, cities, or regions mentioned)
5. Target Audience (who is this document for?)
6. Organizations (company names, institutions mentioned)
7. Dates (any significant dates mentioned in the content)
8. Brief Summary (2-3 sentences)

Return your analysis as a JSON object with these exact fields:
{
  "documentType": "string",
  "topics": ["string"],
  "categories": ["string"],
  "geographicFocus": ["string"],
  "targetAudience": "string",
  "organizations": ["string"],
  "extractedDates": ["string"],
  "summary": "string"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a document analysis expert. Analyze documents and extract structured metadata in JSON format. Be concise and accurate.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "document_tags",
          strict: true,
          schema: {
            type: "object",
            properties: {
              documentType: {
                type: "string",
                description: "The type/category of the document",
              },
              topics: {
                type: "array",
                items: { type: "string" },
                description: "Main topics covered in the document",
              },
              categories: {
                type: "array",
                items: { type: "string" },
                description: "Business categories the document belongs to",
              },
              geographicFocus: {
                type: "array",
                items: { type: "string" },
                description: "Geographic locations mentioned or relevant",
              },
              targetAudience: {
                type: "string",
                description: "Intended audience for this document",
              },
              organizations: {
                type: "array",
                items: { type: "string" },
                description: "Company or organization names mentioned",
              },
              extractedDates: {
                type: "array",
                items: { type: "string" },
                description: "Significant dates found in the document",
              },
              summary: {
                type: "string",
                description: "Brief 2-3 sentence summary of the document",
              },
            },
            required: [
              "documentType",
              "topics",
              "categories",
              "geographicFocus",
              "targetAudience",
              "organizations",
              "extractedDates",
              "summary",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("No response from LLM");
    }

    // Ensure content is a string
    const contentStr = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
    const tags: DocumentTags = JSON.parse(contentStr);
    return tags;
  } catch (error) {
    console.error("Error analyzing document:", error);
    // Return default tags on error
    return {
      documentType: "unknown",
      topics: [],
      categories: [],
      geographicFocus: [],
      targetAudience: "unknown",
      organizations: [],
      extractedDates: [],
      summary: "Failed to analyze document",
    };
  }
}

/**
 * Batch analyze multiple documents (useful for initial scan)
 */
export async function batchAnalyzeDocuments(
  documents: Array<{ fileName: string; content: string }>
): Promise<DocumentTags[]> {
  const results: DocumentTags[] = [];

  // Process in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((doc) => analyzeDocument(doc.fileName, doc.content))
    );
    results.push(...batchResults);

    // Small delay between batches
    if (i + batchSize < documents.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Calculate similarity between two documents based on their content
 * Returns a score from 0-100
 */
export function calculateSimilarity(content1: string, content2: string): number {
  // Simple similarity based on common words
  // In production, you might want to use more sophisticated algorithms

  const words1 = new Set(
    content1
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3)
  );
  const words2 = new Set(
    content2
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3)
  );

  const intersection = new Set(Array.from(words1).filter((w) => words2.has(w)));
  const union = new Set([...Array.from(words1), ...Array.from(words2)]);

  if (union.size === 0) return 0;

  return Math.round((intersection.size / union.size) * 100);
}

/**
 * Detect if two filenames suggest they are versions of the same document
 */
export function detectVersionPattern(fileName1: string, fileName2: string): boolean {
  // Remove extensions
  const name1 = fileName1.replace(/\.[^.]+$/, "").toLowerCase();
  const name2 = fileName2.replace(/\.[^.]+$/, "").toLowerCase();

  // Check for common version patterns
  const versionPatterns = [
    /v\d+/g, // v1, v2, etc.
    /version\s*\d+/g,
    /_\d+$/g, // ending with _1, _2
    /\(\d+\)/g, // (1), (2)
    /final|draft|updated|new|latest|old/gi,
  ];

  // Remove version indicators and compare
  let cleanName1 = name1;
  let cleanName2 = name2;

  for (const pattern of versionPatterns) {
    cleanName1 = cleanName1.replace(pattern, "");
    cleanName2 = cleanName2.replace(pattern, "");
  }

  // Trim and normalize spaces
  cleanName1 = cleanName1.trim().replace(/\s+/g, " ");
  cleanName2 = cleanName2.trim().replace(/\s+/g, " ");

  // If the cleaned names are very similar, they're likely versions
  return cleanName1 === cleanName2 || cleanName1.includes(cleanName2) || cleanName2.includes(cleanName1);
}
