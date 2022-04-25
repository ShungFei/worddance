export default function InputForm({onSubmit, onChange, value}) {
  return (
    <form className="form" onSubmit={onSubmit}>
      <input className="text-area" placeholder="Type your sentence here" value={value} onChange={onChange} />
    </form>
  )
}
