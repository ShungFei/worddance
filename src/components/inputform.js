export default function InputForm({onSubmit, onChange, value}) {

    return (

        <form onSubmit={onSubmit}>
            <input
                value={value}
                onChange={onChange}
            />
            <button type="submit">Send</button>
        </form>
    )
}