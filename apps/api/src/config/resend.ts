import { Request, Response } from "express";
import {Resend} from "resend";

if(!process.env.RESEND_API_KEY) {
    throw new Error("Resend api key not set.");
}

export const resend = new Resend(process.env.RESEND_API_KEY);
