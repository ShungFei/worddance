import { useState, useEffect } from 'react'
import InputForm from '../components/inputform'
import Submission from '../components/submission'
import vocab from '../lib/vocab'

async function query(data) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/bert-base-uncased",
    {
      headers: { Authorization: "Bearer {API_TOKEN}" },
      method: "POST",
      body: JSON.stringify(data),
    }
  )
  const result = await response.json()
  return result
}


export default function IndexPage() {
  const getRandomWord = () => vocab[Math.floor(Math.random() * vocab.length)]

  const mask_token = "[MASK]"

  const [score, setScore] = useState(0)
  const [targetWords, setTargetWords] = useState(["capital"])
  const [userSubmissions, setUserSubmissions] = useState([])
  const [newSubmission, setNewSubmission] = useState(`Paris is the ${mask_token} of France.`)


  const userSubmitted = (event) => {
    event.preventDefault()


    if (!newSubmission.includes(mask_token)) {
      // Do not submit if input does not contain mask token
      return
    }

    let submissionObject = {
      content: newSubmission,
      date: new Date().toISOString(),
      id: userSubmissions.length + 1,
    }

    setUserSubmissions(userSubmissions.concat(submissionObject))

    query({ "inputs": newSubmission }).then((response) => {
      console.log(JSON.stringify(response))
      const token_strings = (response.map(element => element.token_str))
      const targetWordIndices = targetWords.map(targetWord => token_strings.indexOf(targetWord))
      const maxIndex = Math.max(targetWordIndices)
      console.log(token_strings);
      console.log(targetWordIndices)
      console.log(maxIndex);

      if (maxIndex >= 0) {
        const bestScoringTargetWordIndex = targetWordIndices.indexOf(maxIndex)
        submissionObject.content = newSubmission.replace(mask_token, targetWords[bestScoringTargetWordIndex])
        setScore(score + 5 - maxIndex)
      } else {
        submissionObject.content = newSubmission.replace(mask_token, token_strings[0])
      }
      setUserSubmissions(userSubmissions.concat(submissionObject))
    })

    setTargetWords([getRandomWord()])
    setNewSubmission('')
  }

  const handleInputChange = (event) => {
    const targetValue = event.target.value
    const autoCompleteMaskChar = mask_token[0]
    if (targetValue.includes(autoCompleteMaskChar) && !newSubmission.includes(autoCompleteMaskChar)) {
      let autoCompleteIndex = targetValue.indexOf(autoCompleteMaskChar)
      setNewSubmission(`${newSubmission.slice(0, autoCompleteIndex)}${mask_token}${newSubmission.slice(autoCompleteIndex)}`)
    } else {
      setNewSubmission(targetValue)
    }
  }

  return (

    <div>
      <h1>Word Dance</h1>
      <h2>Score: {score}</h2>
      <p>Try to make the machine learning model fill in {mask_token} with <strong>{targetWords.join(", or")}</strong></p>
      <p>If <strong>{targetWords.join(", or")}</strong> is within its 5 best guesses your score will increase from 1 to 5 points depending on its ranking</p>
      <p>Give me a good show - dance with your words!</p>
      <InputForm onSubmit={userSubmitted} onChange={handleInputChange} value={newSubmission} />
      <ul>
        {[...userSubmissions].reverse().map(submission =>
          <Submission key={submission.id} content={submission.content} />
        )}
      </ul>
    </div>
  )
}
