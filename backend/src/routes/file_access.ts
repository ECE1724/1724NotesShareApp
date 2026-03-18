import { Router } from "express";
import { db } from "../database";

const router = Router();

// -----------------------
// Helper (provided)
// -----------------------
function isErrorWithMessage(e: unknown): e is { message: string } {
    return (
        typeof e === "object" &&
        e !== null &&
        "message" in e &&
        typeof (e as { message?: unknown }).message === "string"
    );
}

// -----------------------
// GET /api/files/access
// -----------------------
/**
 *  Get all file access permission for a user
 */
router.get("/", async (_req, res, next) => {
    try{
        const all_file_access = await db.get_all_file_access()
        res.status(200).json(all_file_access)
    }
    catch (err){
        res.status(400).json({error: "Error getting file access"})
    }
});


// -----------------------
// POST /api/files/access
// -----------------------
/**
 *  Create a file access permission for a user
 */
router.post("/", async (_req, res, next) => {
    try{
        const file_access = await db.create_or_update_file_access(_req.body)
        res.status(201).json(file_access)
    }
    catch (err){
        res.status(400).json({error: "Error creating or updating file access"})
    }
});

export default router;