import type { Request, Response } from "express";
import { createGoogleDriveDocument } from "../../services/document.service.ts";

export async function createDocument (req: Request, res: Response ) {
    try {
        const { userId } = req.body;

        const result = await createGoogleDriveDocument(userId);
        if(result.requireGoogleDriveConnection){
            return res.status(403).json({
                status: false,
                requiresGoogleDrive: true,
                message: "Google drive connection is required."
            })
        }

        return res.status(200).json({
            status: true,
            message: "Document created successfully."
        });
        
    } catch (error) {
        console.error("Create Document error: ", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error."
        })
    }
}