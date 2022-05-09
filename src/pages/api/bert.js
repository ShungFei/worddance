// Securely access huggingface API with environment variables
export default async function handler(req, res) {
  console.log(req)
  debugger
  const response = await fetch("https://api-inference.huggingface.co/models/bert-base-uncased", {
    headers: {Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`},
    method: "POST",
    body: req.body,
  })
  const result = await response.json()
  res.status(200).json(result)
}
