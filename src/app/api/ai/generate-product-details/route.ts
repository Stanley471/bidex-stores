import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { verifyAdminAuth } from '@/lib/auth/authorization'

interface SpecificationItem {
  key: string
  value: string
}

interface AiResponsePayload {
  name?: string
  description?: string
  specifications?: SpecificationItem[]
}

export async function POST(request: Request) {
  const { errorResponse } = await verifyAdminAuth()
  if (errorResponse) return errorResponse

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || !apiKey.trim()) {
    return NextResponse.json(
      {
        success: false,
        message:
          'Gemini API key is missing. Please set GEMINI_API_KEY in your environment variables.',
      },
      { status: 400 },
    )
  }

  let body: { prompt?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body. Expected JSON.' },
      { status: 400 },
    )
  }

  const prompt = body.prompt?.trim()
  if (!prompt) {
    return NextResponse.json(
      { success: false, message: 'Please enter a product title or description.' },
      { status: 400 },
    )
  }

  const systemPrompt = `You are an expert e-commerce catalog assistant. Given a rough product title or description from a seller, generate accurate and professional product details.

Output MUST be a JSON object with:
1. "name": A clean, descriptive, professional e-commerce product title following standard naming conventions: Brand + Model + Key Variant details (e.g. "Apple iPhone 13 128GB - Red" or "DeWalt 20V MAX Cordless Compact Drill").
2. "description": A compelling, professional 2-4 sentence product description highlighting core benefits, build quality, and key appeal.
3. "specifications": An array of objects [{ "key": string, "value": string }] representing verified, standard factual specifications for that exact product model (e.g. for a phone: Processor, RAM, Battery Capacity, Display Type & Size, Resolution, Camera Specs, Weight, Dimensions, Network Bands, Biometric Security; for tools: Motor Type, Power Source, Chuck Size, RPM, Weight, Material).

CRITICAL ACCURACY RULES:
- "name" should be properly capitalized, clean, and concise, adhering to Brand + Model + Key Variant details.
- Only include specifications you have HIGH FACTUAL CONFIDENCE about for this exact product model.
- Do NOT guess, hallucinate, or invent values.
- Do NOT include listing-specific variant details (such as a specific color, cosmetic condition like "renewed/used", or single storage option) in the specifications list, as the seller manages variants separately.
- If you cannot confidently identify the exact product model, provide a helpful generic description, formatted name, and an empty array for specifications ([]).
- Never return markdown code fences. Respond ONLY with valid JSON matching { "name": string, "description": string, "specifications": [{ "key": string, "value": string }] }.`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  const genAI = new GoogleGenerativeAI(apiKey.trim())
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash'

  try {
    let result
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      })
      result = await model.generateContent(`Product: "${prompt}"`, {
        signal: controller.signal,
      })
    } catch (modelError: any) {
      if (
        !process.env.GEMINI_MODEL &&
        modelName === 'gemini-3.5-flash' &&
        (modelError?.status === 404 ||
          modelError?.message?.includes('404') ||
          modelError?.message?.toLowerCase().includes('not found') ||
          modelError?.message?.toLowerCase().includes('is not supported'))
      ) {
        const fallbackModel = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: systemPrompt,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        })
        result = await fallbackModel.generateContent(`Product: "${prompt}"`, {
          signal: controller.signal,
        })
      } else {
        throw modelError
      }
    }
    clearTimeout(timeoutId)

    const content = result.response.text()

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'AI returned an empty response.' },
        { status: 502 },
      )
    }

    let cleanContent = String(content).trim()
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    }

    let parsed: AiResponsePayload
    try {
      parsed = JSON.parse(cleanContent)
    } catch {
      return NextResponse.json(
        { success: false, message: 'AI response was not valid JSON.' },
        { status: 502 },
      )
    }

    const name = typeof parsed.name === 'string' ? parsed.name.trim() : ''
    const description = typeof parsed.description === 'string' ? parsed.description.trim() : ''
    const specifications: SpecificationItem[] = Array.isArray(parsed.specifications)
      ? parsed.specifications
          .filter(
            (s): s is SpecificationItem =>
              Boolean(s && typeof s.key === 'string' && typeof s.value === 'string' && s.key.trim() && s.value.trim()),
          )
          .map((s) => ({ key: s.key.trim(), value: s.value.trim() }))
      : []

    return NextResponse.json({
      success: true,
      data: {
        name,
        description,
        specifications,
      },
    })
  } catch (error) {
    clearTimeout(timeoutId)

    if (
      controller.signal.aborted ||
      (error instanceof Error && (error.name === 'AbortError' || error.message.toLowerCase().includes('abort')))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service took too long to respond. Please try again.',
          message: 'AI service took too long to respond. Please try again.',
        },
        { status: 504 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error contacting Gemini AI service.',
      },
      { status: 500 },
    )
  }
}
