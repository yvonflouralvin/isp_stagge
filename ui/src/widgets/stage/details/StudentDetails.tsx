

export default function StudentDetails(e: { label: string, value: React.ReactNode }) {
    return <div className="flex gap-[10px]">
        <div>{e.label} :</div>
        <div>{e.value}</div>
    </div>
}