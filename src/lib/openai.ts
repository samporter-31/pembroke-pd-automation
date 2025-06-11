import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Test function
export async function testOpenAI() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: "Say 'GPT-4.1 mini working perfectly!'" }],
      max_tokens: 20
    })
    return response.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return null
  }
}
