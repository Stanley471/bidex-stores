import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

// JWTs are signed so the token's contents cannot be modified in transit without detection.
// They expire to limit how long a leaked or stolen token can be used.
// JWT secrets should never be committed to Git because anyone with access to the repository could forge tokens.

const encoder = new TextEncoder()

function getSecret(): Uint8Array {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set.')
  }

  return encoder.encode(jwtSecret)
}

export async function createToken(payload: JWTPayload): Promise<string> {
  const secret = getSecret()

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const secret = getSecret()
  const { payload } = await jwtVerify(token, secret)
  return payload
}
