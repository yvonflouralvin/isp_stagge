'use client'

import { useEffect, useState } from "react" 
import api from "@/lib/network/api";
import cookies from "@/lib/shared/cookies"

export default function PaymentsLists(){

    const [payments, setPayments] = useState([])
    const [totalSum, setTotalSum] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(false)
    
    const showMe = async ()=> {
        setLoading(true)
        const result = await api(cookies).get(`/isp_stage/isp-paiements/?page=${page}&page_size=${pageSize}`);
        setPayments(result.data.results.results)
        setTotalSum(result.data.results.total_sum)
        setCount(result.data.count)
        setLoading(false)
    }

    useEffect(() => {
        showMe()
    }, [page])

    // Pagination
    const totalPages = Math.ceil(count / pageSize)
    
     return (
        <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Payments Lists</h1>

        <p className="mb-4 font-semibold">Total payments collected: {totalSum}</p>
        {/* Rapport des stages */}
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">Rapport des stages</h2>
            <p>Total montant des paiements: {totalSum} $USD</p>
            <p>Total paiements: {count}</p>
        </div>

        {loading ? (
            <p>Loading...</p>
        ) : (
            <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
                <tr>
                <th className="px-4 py-2 border">Matricule</th>
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Prénom</th>
                <th className="px-4 py-2 border">Promotion</th>
                <th className="px-4 py-2 border">Vacation</th>
                <th className="px-4 py-2 border">Date Paiement</th>
                <th className="px-4 py-2 border">Montant</th>
                </tr>
            </thead>
            <tbody>
                {payments.map((p: any) => (
                <tr key={p.id}>
                    <td className="px-4 py-2 border">{p.student.matricule}</td>
                    <td className="px-4 py-2 border">{p.student.nom}</td>
                    <td className="px-4 py-2 border">{p.student.prenom}</td>
                    <td className="px-4 py-2 border">{p.student.codpromo}</td>
                    <td className="px-4 py-2 border">{p.student.vacation}</td>
                    <td className="px-4 py-2 border">{p.datepai}</td>
                    <td className="px-4 py-2 border">{p.montant}</td>
                </tr>
                ))}
            </tbody>
            </table>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-4 gap-2">
            <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            >
            Previous
            </button>
            <span className="px-3 py-1">
            Page {page} / {totalPages || 1}
            </span>
            <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            >
            Next
            </button>
        </div>

        </div>
    )
}