import type { Request, Response } from "express";
import { unlink } from "node:fs/promises";
import { uploadFileToCloudinary as uploadToCloudinary } from "../../config/cloudinary.ts";
import prisma from "@nexora/database"
import { documentSchema } from "@nexora/validation";

export const uploadFile = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: "No file provided. Send a multipart form field named 'file'.",
            });
        }
        const avatar = await uploadToCloudinary(req.file.path);
        console.log(avatar);

        const parsedData = documentSchema.safeParse({ name})

        return res.status(201).json({
            status: true,
            message: "File uploaded successfully.",
        });
    } catch (error) {
        const details =
        typeof error === "object" && error !== null
            ? error as { message?: unknown; http_code?: unknown; name?: unknown }
            : undefined;

    console.error("File uploading error:", {
        name: details?.name,
        message: details?.message,
        http_code: details?.http_code,
        error,
    });

    return res.status(502).json({
        status: false,
        message: "File upload failed.",
        details: details?.message ?? "Unknown upload error",
        http_code: details?.http_code,
    });
    } finally {
        if (req.file?.path) {
            await unlink(req.file.path).catch((cleanupError) => {
                console.error("Could not remove temporary upload:", cleanupError);
            });
        }
    }
};
