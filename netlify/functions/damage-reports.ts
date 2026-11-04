import type { Context } from "@netlify/functions";
import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { cropDamageReports } from "../../db/schema.js";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    if (req.method === "GET") {
      const records = await db
        .select()
        .from(cropDamageReports)
        .orderBy(desc(cropDamageReports.createdAt))
        .limit(50);

      return new Response(JSON.stringify(records), {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    if (req.method === "POST") {
      const body = await req.json();

      const {
        reportNumber,
        farmerName,
        farmerPhone,
        state = "Tamil Nadu",
        district,
        village,
        surveyNumber = "",
        cropName,
        cropVariety = "",
        affectedAreaAcres,
        totalAreaAcres = "",
        insuranceScheme = "PMFBY",
        policyOrApplicationNumber = "",
        damageCategory,
        damageDate,
        description,
        damageImages = [],
        fieldImages = [],
        intimationChannel = "Web Portal",
      } = body;

      if (!farmerName || !farmerPhone || !district || !village || !cropName || !affectedAreaAcres || !damageCategory || !damageDate) {
        return new Response(
          JSON.stringify({ error: "Missing required fields for damage report" }),
          { status: 400, headers: CORS_HEADERS }
        );
      }

      const generatedNumber = reportNumber || `INT-PMFBY-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

      const [newRecord] = await db
        .insert(cropDamageReports)
        .values({
          reportNumber: generatedNumber,
          farmerName,
          farmerPhone,
          state,
          district,
          village,
          surveyNumber,
          cropName,
          cropVariety,
          affectedAreaAcres: String(affectedAreaAcres),
          totalAreaAcres: String(totalAreaAcres),
          insuranceScheme,
          policyOrApplicationNumber,
          damageCategory,
          damageDate,
          description: description || "Crop damage reported by farmer.",
          damageImages,
          fieldImages,
          status: "Intimated (Pending Field Inspection)",
          intimationChannel,
        })
        .returning();

      return new Response(
        JSON.stringify({
          success: true,
          reportNumber: newRecord.reportNumber,
          record: newRecord,
        }),
        { status: 201, headers: CORS_HEADERS }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: CORS_HEADERS,
    });
  } catch (error: any) {
    console.error("Error in damage-reports function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process damage report",
        fallbackAvailable: true,
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
};
