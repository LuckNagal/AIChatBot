import {NextResponse} from 'next/server'
import fetch from 'node-fetch'
import { Configuration, OpenAI } from 'openai';
// import crypto from 'crypto'

const API_KEY = process.env.OpenAI_API_KEY;
// const API_KEY = process.env.GEMINI_API_KEY;  // Your API key stored in an environment variable

const systemPrompt = `You are an AI-powered customer support assistant for HeadstartAI, a platform that provides AI-driven interviews for software engineering positions.

1. HeadstartAI offers AI-powered interviews to help candidates prepare for real job interviews in software engineering.
2. Our platform covers a wide range of topics including algorithms, data structures, system design, and behavioral questions.
3. Users can access our services through our website or mobile app.
4. If asked about technical issues, guide users to our troubleshooting page or suggest contacting our technical support team.
5. Always prioritize user privacy and confidentiality; never share personal information.
6. If you're unsure about any information, it's okay to say you don't know and offer to connect the user with a human representative.

Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all HeadstartAI users.`;

// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
//   });
  
//   const openai = new OpenAIApi(configuration);
  
//   async function getAIResponse(userInput) {
//     const completion = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "system",
//           content: systemPrompt
//         },
//         {
//           role: "user",
//           content: userInput
//         }
//       ],
//     });
  
//     return completion.data.choices[0].message.content;
//   }
  
//   export async function handler(req, res) {
//     if (req.method === 'POST') {
//       try {
//         const data = await req.json();
//         const response = await getAIResponse(data.userInput);
//         res.status(200).json({ message: response });
//       } catch (error) {
//         console.error('Error processing the AI response:', error);
//         res.status(500).json({ error: 'Failed to handle AI response' });
//       }
//     } else {
//       res.setHeader('Allow', ['POST']);
//       res.status(405).end('Method Not Allowed');
//     }
//   }
export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
            role: 'system',
            content: systemPrompt
            },
            ...data,
        ],
        model: 'gpt-3.5-turbo',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}