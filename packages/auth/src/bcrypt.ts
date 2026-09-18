import bcrypt from "bcrypt";

export async function hashedPassword(password: string) {
    return await bcrypt.hash(password, 12); 
}

export async function comparePassword(hash: string, password: string) {
    return await bcrypt.compare(password, hash);
}