import {useEffect, useState} from "react"
import {CountdownCircleTimer} from "react-countdown-circle-timer"
import InputForm from "../components/InputForm"
import Submission from "../components/Submission"
import TutorialModal from "../components/TutorialModal"
import WordStackItem from "../components/WordStackItem"
import vocab from "../lib/vocab"

let interval = null

async function query(data) {
  const response = await fetch("https://api-inference.huggingface.co/models/bert-base-uncased", {
    headers: {Authorization: "Bearer {API_TOKEN}"},
    method: "POST",
    body: JSON.stringify(data),
  })
  const result = await response.json()
  return result
}

export default function IndexPage() {
  const mask_token = "[MASK]"
  const maximumTime = 120
  const bonusTimeOnCorrectAnswer = 5

  const [isGameOver, setIsGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [timerKey, setTimerKey] = useState(0)
  const [timerDuration, setTimerDuration] = useState(maximumTime)
  const [startDate, setStartDate] = useState(Date.now)
  const [targets, setTargets] = useState([{id: vocab.indexOf("capital"), word: "capital"}])
  const [userSubmissions, setUserSubmissions] = useState([])
  const [newSubmission, setNewSubmission] = useState(`Paris is the ${mask_token} of France.`)

  const addRandomTarget = () => {
    const wordsInPlay = targets.map((target) => target.word)
    const vocabNotInPlay = vocab.filter((word) => !wordsInPlay.includes(word))
    if (vocabNotInPlay.length > 0) {
      const randomIndex = Math.floor(Math.random() * vocabNotInPlay.length)
      const randomWord = vocabNotInPlay[randomIndex]
      let newTarget = {
        id: vocab.indexOf(randomWord),
        word: randomWord,
      }
      setTargets((target) => target.concat(newTarget))
    }
  }

  useEffect(() => {
    interval = setInterval(() => addRandomTarget(), 5000)
  }, [])

  const restartGame = () => {
    setStartDate(Date.now())
    setCorrectAnswers(0)
    setScore(0)
    setTimerDuration(maximumTime)
    setTargets([])
  }

  const gameOver = () => {
    setIsGameOver(true)
    clearInterval(interval)
  }

  const addBonusTime = () => {
    const secondsSinceStart = (Date.now() - startDate) / 1000
    setTimerDuration(
      Math.min(maximumTime, maximumTime - secondsSinceStart + bonusTimeOnCorrectAnswer * (correctAnswers + 1))
    )
    setCorrectAnswers((prevCorrectAnswers) => prevCorrectAnswers + 1)

    // Changing key of countdown timer rerenders with added time
    setTimerKey((previousKey) => previousKey + 1)
  }

  const userSubmitted = (event) => {
    event.preventDefault()

    if (!newSubmission.includes(mask_token) || isGameOver) {
      // Do not submit if input does not contain mask token or when game over
      return
    }

    const token_index = newSubmission.indexOf(mask_token)

    let submissionObject = {
      content: (
        <>
          {newSubmission.slice(0, token_index)}
          <span className="awaiting-token">{mask_token}</span>
          {newSubmission.slice(token_index + mask_token.length)}
        </>
      ),
      token_index: token_index,
      date: new Date().toISOString(),
      id: userSubmissions.length + 1,
    }

    setUserSubmissions(userSubmissions.concat(submissionObject))

    query({inputs: newSubmission}).then((response) => {
      // console.log(JSON.stringify(response))
      const topFiveTokens = response.map((element) => element.token_str)
      const targetIndices = targets.map((target) => topFiveTokens.indexOf(target.word))
      const maxIndex = Math.max(...targetIndices)
      // console.log(token_strings)
      // console.log(targetIndices)
      // console.log(maxIndex)

      // All targetIndices elements are -1 if no target word is within the top 5 machine guesses
      if (maxIndex >= 0) {
        const bestScoringTargetIndex = targetIndices.indexOf(maxIndex)
        const bestScoringTarget = targets[bestScoringTargetIndex]
        submissionObject.content = (
          <>
            {newSubmission.slice(0, token_index)}
            <span className="correct-token">{bestScoringTarget.word}</span>
            {newSubmission.slice(token_index + mask_token.length)}
          </>
        )
        const scoreEarned = Math.ceil(500 + 500 * response[topFiveTokens.indexOf(bestScoringTarget.word)].score)
        setScore((previousScore) => previousScore + scoreEarned)
        setTargets((target) => target.filter((target) => target.id != bestScoringTarget.id))
        addBonusTime()
      } else {
        submissionObject.content = (
          <>
            {newSubmission.slice(0, token_index)}
            <span className="incorrect-token">{topFiveTokens[0]}</span>
            {newSubmission.slice(token_index + mask_token.length)}
          </>
        )
      }
      setUserSubmissions(userSubmissions.concat(submissionObject))
    })

    setNewSubmission("")
  }

  const handleWordExpiry = (id) => {
    setTargets((target) => target.filter((target) => target.id != id))
  }

  const handleInputChange = (event) => {
    const targetValue = event.target.value
    const autoCompleteMaskChar = mask_token[0]
    if (targetValue.includes(autoCompleteMaskChar) && !newSubmission.includes(autoCompleteMaskChar)) {
      let autoCompleteIndex = targetValue.indexOf(autoCompleteMaskChar)
      setNewSubmission(
        `${newSubmission.slice(0, autoCompleteIndex)}${mask_token}${newSubmission.slice(autoCompleteIndex)}`
      )
    } else {
      setNewSubmission(targetValue)
    }
  }

  const renderTime = ({remainingTime}) => {
    if (remainingTime === 0) {
      return (
        <div className="timer-value">
          <h2>Game over!</h2>
          <p>Ctrl R to restart</p>
        </div>
      )
    }
    const minutes = Math.floor(remainingTime / 60)
    const seconds = remainingTime % 60
    return (
      <div className="timer-value">
        <h2>
          {minutes}:{seconds.toLocaleString("en-US", {minimumIntegerDigits: 2, useGrouping: false})}
        </h2>
      </div>
    )
  }

  return (
    <div>
      <div className="container">
        <div className="left-panel">
          <CountdownCircleTimer
            key={timerKey}
            isPlaying
            duration={maximumTime}
            initialRemainingTime={timerDuration}
            colors={["#5fff65", "#a3daff", "#ffe9a7", "#ff7272"]}
            colorsTime={[30, 6, 3, 0]}
            strokeWidth={32}
            trailColor="var(--bg)"
            size={256}
            onComplete={gameOver}
            strokeLinecap="butt"
          >
            {renderTime}
          </CountdownCircleTimer>
          <h2>Score: {score}</h2>
        </div>

        <div className="word-stack">
          {[...targets].reverse().map((target) => (
            <WordStackItem
              key={target.id}
              id={target.id}
              targetWord={target.word}
              onWordExpiry={handleWordExpiry}
              isGameOver={isGameOver}
            />
          ))}
        </div>

        <div className="submission-stack">
          {userSubmissions.map((submission) => (
            <Submission key={submission.id} submission={submission} />
          ))}
        </div>

        <InputForm onSubmit={userSubmitted} onChange={handleInputChange} value={newSubmission} />

        <TutorialModal />
      </div>
    </div>
  )
}
