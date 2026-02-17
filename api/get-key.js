export default function handler(req, res) {
  // Ye Vercel ke environment variable se key uthayega
  res.status(200).json({ key: process.env.GOOGLE_API_KEY });
}