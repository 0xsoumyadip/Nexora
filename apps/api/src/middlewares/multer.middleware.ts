import multer from "multer";
import path from "node:path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/temp"))
    },
    filename: (req, file, cb) =>  {
        const uniqueName = `${Date.now()}-${file.originalname}`

        cb(null, uniqueName)
    }
});

export const upload = multer({storage});