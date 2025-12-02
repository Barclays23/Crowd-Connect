import bcrypt from 'bcryptjs';


export async function hashPassword (password: string): Promise<string> {
  const saltRounds = 10; 
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}


export async function comparePassword(plainPassword: string, hashedPassword: string) {
  if (!plainPassword || !hashedPassword) {
    throw new Error("Password comparison failed: missing arguments");
  }

  return await bcrypt.compare(plainPassword, hashedPassword);
}