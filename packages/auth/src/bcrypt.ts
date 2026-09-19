import bcrypt from "bcrypt";

export async function hashedPassword(password: string) {
    return await bcrypt.hash(password, 12); 
}

export async function comparePassword(data: {hash: string, password: string}) {
    const { hash, password } = data;
    
    return await bcrypt.compare(password, hash);
}