

export default function SectionTitle(props: { text: string }) {
    return <div className='my-[20px] border-t border-t-inherent font-bold'>
        <h1>{props.text}</h1>
    </div>
}