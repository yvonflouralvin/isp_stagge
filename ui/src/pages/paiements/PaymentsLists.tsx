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
    const [ispPaiementDpts, setIspPaiementDpts] = useState([])
    const [selectedIspPaiementDpt, setSelectedIspPaiementDpt] = useState<any>(null)
    const [selectedVacation, setSelectedVacation] = useState<any>(null)
    
    const showMe = async ()=> {
        setLoading(true)
        var url = `/isp_stage/isp-paiements/?page=${page}&page_size=${pageSize}`
        if(selectedIspPaiementDpt != "all" && selectedIspPaiementDpt != null) url = url + `&student__codpromo=${selectedIspPaiementDpt}`
        if(selectedVacation != "all" && selectedVacation != null) url = url + `&student__vacation=${selectedVacation}`
        const result = await api(cookies).get(url);
        setPayments(result.data.results.results)
        setTotalSum(result.data.results.total_sum)
        setCount(result.data.count)
        setLoading(false)
    }

    const handlePrint = async () => {
        try {
            let url = `/isp_stage/isp-paiements/print/?`

            if (selectedIspPaiementDpt !== "all" && selectedIspPaiementDpt != null) {
                url += `student__codpromo=${selectedIspPaiementDpt}&`
            }

            if (selectedVacation !== "all" && selectedVacation != null) {
                url += `student__vacation=${selectedVacation}&`
            }

            const response = await api(cookies).get(url, {
                responseType: "blob", // IMPORTANT pour PDF
            })

            // Créer un blob et déclencher le téléchargement
            const blob = new Blob([response.data], { type: "application/pdf" })
            const downloadUrl = window.URL.createObjectURL(blob)

            const link = document.createElement("a")
            link.href = downloadUrl
            link.download = "paiements.pdf"
            document.body.appendChild(link)
            link.click()

            // Clean
            link.remove()
            window.URL.revokeObjectURL(downloadUrl)

        } catch (error) {
            console.error("Erreur impression :", error)
        }
    }

    const showIspPaiementDpts = async ()=> {
        const result = await api(cookies).get(`/isp_stage/isp-dept-mapping/?no_pagination=true`);
        setIspPaiementDpts(result.data.results.results)
    }

    useEffect(() => {
        showMe()
        showIspPaiementDpts()
    }, [page, selectedIspPaiementDpt, selectedVacation])

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
            // Ajouter un filtre pour le codepromo
            <>
           <div className="flex items-center px-[10px] py-[4px] border border-gray-300 rounded">
                <p className="flex-1">Filtrer les resultats</p>
                 <select value={selectedIspPaiementDpt} className='border rounded px-2 py-1 mb-2' onChange={(e) => setSelectedIspPaiementDpt(e.target.value)}>
                <option value="all">Toutes les promotions</option>
                {ispPaiementDpts.map((p: any) => (
                    <option key={p.id} value={p.libelle}>{p.libelle}</option>
                ))}
            </select>
            <select value={selectedVacation} className='border rounded px-2 py-1 mb-2' onChange={(e) => setSelectedVacation(e.target.value)}>
                <option value="all">Toutes les vacations</option>
                <option value="Jour">Jour</option>
                <option value="Soir">Soir</option>
            </select>
            <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-0 rounded hover:bg-blue-700"
            >
                Imprimer PDF
            </button>
           </div>
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
            </>
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