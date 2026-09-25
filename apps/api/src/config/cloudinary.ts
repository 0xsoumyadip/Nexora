import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_API_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadFile = async(localPath: string) => {
    try {
        if(!localPath) {
            throw new Error("File path must be required.");
        }

        const response = await cloudinary.uploader.upload(localPath, {
            resource_type: "auto"
        });

        console.log("File uploaded successfully.");
        return response;
    } catch (error) {
        console.error("Cloudinary error: ", error);
        throw error;
    }
}