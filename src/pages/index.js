import { useState, useEffect } from 'react'
import InputForm from '../components/InputForm'
import Submission from '../components/Submission'
import WordStackItem from '../components/WordStackItem'
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
  const mask_token = "[MASK]"

  // const [gameTimer, setGameTimer] = useState(Date.now())
  const [score, setScore] = useState(0)
  const [targetWords, setTargetWords] = useState([{ id: vocab.indexOf("capital"), word: "capital" }])
  const [userSubmissions, setUserSubmissions] = useState([])
  const [newSubmission, setNewSubmission] = useState(`Paris is the ${mask_token} of France.`)

  const addRandomTargetWord = () => {
    const wordsInPlay = targetWords.map(targetWord => (targetWord.word))
    const vocabNotInPlay = vocab.filter(word => !(wordsInPlay.includes(word)))
    if (vocabNotInPlay.length > 0) {
      const randomIndex = Math.floor(Math.random() * vocabNotInPlay.length)
      const randomWord = vocabNotInPlay[randomIndex]
      let newTargetWord = {
        id: vocab.indexOf(randomWord),
        word: randomWord
      }
      setTargetWords(targetWords => (targetWords.concat(newTargetWord)))
    }
  }

  useEffect(() => {
    const interval = setInterval(() => addRandomTargetWord(), 5000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  const userSubmitted = (event) => {
    event.preventDefault()


    if (!newSubmission.includes(mask_token)) {
      // Do not submit if input does not contain mask token
      return
    }

    const token_index = newSubmission.indexOf(mask_token)

    let submissionObject = {
      content: <>{newSubmission.slice(0, token_index)}<span className="awaiting-token">{mask_token}</span>{newSubmission.slice(token_index + mask_token.length)}</>,
      token_index: token_index,
      date: new Date().toISOString(),
      id: userSubmissions.length + 1,
    }

    setUserSubmissions(userSubmissions.concat(submissionObject))

    query({ "inputs": newSubmission }).then((response) => {
      // console.log(JSON.stringify(response))
      const token_strings = (response.map(element => element.token_str))
      const targetWordIndices = targetWords.map(targetWord => token_strings.indexOf(targetWord.word))
      const maxIndex = Math.max(...targetWordIndices)
      // console.log(token_strings)
      // console.log(targetWordIndices)
      // console.log(maxIndex)

      if (maxIndex >= 0) {
        const bestScoringTargetWordIndex = targetWordIndices.indexOf(maxIndex)
        const bestScoringTargetWord = targetWords[bestScoringTargetWordIndex]
        submissionObject.content = <>{newSubmission.slice(0, token_index)}<span className="correct-token">{bestScoringTargetWord.word}</span>{newSubmission.slice(token_index + mask_token.length)}</>
        setScore(score + 5 - maxIndex)
        setTargetWords(targetWords.filter(targetWord => targetWord.id != bestScoringTargetWord.id))
      } else {
        submissionObject.content = <>{newSubmission.slice(0, token_index)}<span className="incorrect-token">{token_strings[0]}</span>{newSubmission.slice(token_index + mask_token.length)}</>
      }
      setUserSubmissions(userSubmissions.concat(submissionObject))
    })

    setNewSubmission('')
  }

  const handleWordExpiry = (id) => {
    setTargetWords(targetWords.filter(word => word.id != id))
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
      <div className="container">
        <div className="submission-stack">
          {userSubmissions.map(submission =>
            <Submission key={submission.id} submission={submission} />
          )}
        </div>

        <div className="word-stack">
          {targetWords.map(targetWord =>
            <WordStackItem key={targetWord.id} id={targetWord.id} targetWord={targetWord.word} onWordExpiry={handleWordExpiry} />
          )}
        </div>

        <div className="right-panel">
          <p>Score: {score}</p>
          <p>Try to make the machine learning model fill in [MASK] with the words on the left</p>
          <p>If one of the words is within its 5 best guesses your score will increase from 1 to 5 points depending on its ranking</p>
          <p>Give me a good show - dance with your words!</p>
        </div>
        <InputForm onSubmit={userSubmitted} onChange={handleInputChange} value={newSubmission} />
      </div>
    </div>
  )
}
