import bcrypt from 'bcryptjs'

// Passwords should always be hashed before storage so a database leak does not expose plain-text credentials.
// Bcrypt automatically generates a random salt for each hash, which prevents identical passwords from producing identical hashes.
// Passwords should never be decrypted because the application only needs to verify a submitted password against the stored hash.

const BCRYPT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
