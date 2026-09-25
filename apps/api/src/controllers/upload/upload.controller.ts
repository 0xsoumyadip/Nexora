import type { Request, Response } from "express";
import { uploadFile as uploadToCloudinary } from "../../config/cloudinary.ts";

export const uploadFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: "No file provided. Send a multipart form field named 'file'.",
            });
        }

        const result = await uploadToCloudinary(req.file.buffer);
        if(!result){
            return res.status(401).json({
                status: false,
                message: "Failed to upload file. Please try again."
            })
        }

        return res.status(201).json({
            status: true,
            message: "File uploaded successfully.",
            file: result,
        });
    } catch (error) {
        console.error("File uploading error: ", error);
        return res.status(502).json({
            status: false,
            message: "Internal server error.",
        });
    }
};
