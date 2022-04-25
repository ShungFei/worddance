import {CountdownCircleTimer} from "react-countdown-circle-timer"

const renderTime = ({remainingTime}) => {
  // if (remainingTime === 0) {
  //   return <div className="timer">Too late!</div>
  // }

  return <p className="word-timer-value">{remainingTime}</p>
}

export default function WordStackItem({id, targetWord, onWordExpiry}) {
  const onComplete = () => {
    onWordExpiry(id)
  }

  return (
    <div className="word-stack-item">
      {targetWord}
      <div className="word-timer-wrapper">
        <CountdownCircleTimer
          isPlaying
          duration={30}
          colors={["#5fff65", "#a3daff", "#ffe9a7", "#ff7272"]}
          colorsTime={[30, 6, 3, 0]}
          strokeWidth={9}
          trailColor="var(--bg)"
          size={32}
          onComplete={onComplete}
          strokeLinecap="butt"
        >
          {/* {renderTime} */}
        </CountdownCircleTimer>
      </div>
    </div>
  )
}
