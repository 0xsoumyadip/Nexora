import type { Request, Response } from "express";
import { auth } from "@nexora/auth/auth";

export const resendVerification = async(req: Request, res: Response) => {
    try {
        const { email } = req.body;

        await auth.api.sendVerificationEmail({
            body: {email}
        });

        return res.status(200).json({
            status: true,
            message: "Verification email resent"
        })
    } catch (error) {
        return res.status(400).json({
            status: false,
            message: "Unable to resend verification email"
        })
    }
}