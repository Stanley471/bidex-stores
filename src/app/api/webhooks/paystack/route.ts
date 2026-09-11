import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { paymentService } from '@/services/payment.service'

export async function POST(request: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY

  if (!secretKey) {
    return NextResponse.json(
      { success: false, message: 'Paystack secret key is unconfigured.' },
      { status: 500 },
    )
  }

  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json({ success: false, message: 'Missing webhook signature.' }, { status: 400 })
    }

    // Compute expected HMAC SHA-512 hash
    const expectedSignature = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex')

    const signatureBuffer = Buffer.from(signature, 'utf8')
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')

    // Constant-time signature comparison to prevent timing attacks
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return NextResponse.json({ success: false, message: 'Invalid webhook signature.' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)

    // Handle charge.success event idempotently
    if (event && event.event === 'charge.success') {
      const reference = event.data?.reference
      if (reference) {
        await paymentService.verifyOrderPayment(reference)
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully.' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Webhook processing error.' },
      { status: 400 },
    )
  }
}
