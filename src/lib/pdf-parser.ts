import pdfParse from 'pdf-parse'

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('Input is not a valid non-empty Buffer')
  }
  try {
    const data = await pdfParse(buffer)
    return data.text.trim()
  } catch (error) {
    throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}