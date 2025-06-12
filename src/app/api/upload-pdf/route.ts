import { NextRequest, NextResponse } from 'next/server'

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:4000'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      )
    }

    // Forward to microservice
    const microserviceFormData = new FormData()
    microserviceFormData.append('pdf', file)

    const response = await fetch(`${PDF_SERVICE_URL}/extract-text`, {
      method: 'POST',
      body: microserviceFormData
    })

    if (!response.ok) {
      throw new Error(`Microservice error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      text: data.text,
      filename: file.name
    })

  } catch (error) {
    console.error('PDF upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process PDF file' },
      { status: 500 }
    )
  }
}