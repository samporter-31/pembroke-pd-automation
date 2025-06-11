import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromPDF } from '@/lib/pdf-parser'

export async function POST(request: NextRequest) {
  console.log('PDF upload API called')
  
  try {
    const formData = await request.formData()
    const file = formData.get('pdf')
    if (!(file instanceof File)) {
      console.log('Invalid file type or no file provided')
      return NextResponse.json(
        { error: 'Invalid file type or no file provided' },
        { status: 400 }
      )
    }
    
    console.log('File received:', file?.name, file?.type, file?.size)
    
    if (!file) {
      console.log('No file provided')
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      console.log('Invalid file type:', file.type)
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    console.log('Converting file to buffer...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('Buffer created, size:', buffer.length)

    console.log('Extracting text from PDF...')
    const extractedText = await extractTextFromPDF(buffer)
    console.log('Text extracted successfully, length:', extractedText.length)

    const response = {
      success: true,
      text: extractedText,
      filename: file.name
    }

    console.log('Sending response')
    return NextResponse.json(response)

  } catch (error) {
    console.error('PDF upload error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process PDF file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}