import {useRef, useEffect} from "react"

export default function TutorialModal() {
  const modalRef = useRef(null)
  const modalWrapperRef = useRef(null)

  useEffect(() => {
    modalRef.current.showModal()

    // Close modal when clicking outside
    function handleBackdropClick(event) {
      if (modalWrapperRef.current && !modalWrapperRef.current.contains(event.target)) {
        document.removeEventListener("mousedown", handleBackdropClick)
        modalRef.current.close()
      }
    }
    document.addEventListener("mousedown", handleBackdropClick)
  }, [])

  return (
    <dialog className="tutorial-modal" ref={modalRef}>
      <div className="tutorial-modal-wrapper" ref={modalWrapperRef}>
        <h1>Welcome to Word Dance</h1>
        <p>Try to make an AI fill in [MASK] with any word in the center.</p>
        <p>
          If one of the words is within the AI's 5 best guesses you survive for 5 more seconds, and your score increases
          based on how confident it was
        </p>
        <p>Give me a good show - dance with your words!</p>
      </div>
    </dialog>
  )
}
