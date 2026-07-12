'use client'
import React from 'react' 
import api from "@/lib/network/api";
import cookies from "@/lib/shared/cookies"
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalContent } from '@nextui-org/react';
import SearchSelected from '@/components/ui/SearchSelected';

export default function DeptMappingList(){
    const [deptMappings, setDeptMappings] = React.useState<any[]>([]) 
    const [totalSum, setTotalSum] = React.useState(0)
    const [page, setPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(50)
    const [count, setCount] = React.useState(0)
    const [loading, setLoading] = React.useState(false)
    const [selectedIspDept, setSelectedIspDept] = React.useState<any>(null)
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [selectGradeClasse, setSelectGradeClasse] = React.useState<any>(null)

    React.useEffect(() => {
        if(selectedIspDept != null) {
            setIsModalOpen(true)
        }
    }, [selectedIspDept])

    const onClose = () => {
        setSelectedIspDept(null)
        setSelectGradeClasse(null)
        setIsModalOpen(false)
    }
    
    const showMe = async ()=> {
        setLoading(true)
        const result = await api(cookies).get(`/isp_stage/isp-dept-mapping/?page=${page}&page_size=${pageSize}`);
        setDeptMappings(result.data.results.results)
        setTotalSum(result.data.results.total_sum)
        setCount(result.data.count)
        setLoading(false)
    }

    React.useEffect(() => {
        showMe()
    }, [page])

     // Pagination
    const totalPages = Math.ceil(count / pageSize)

    const updateIspDeptMapping = async () => {
        const _values = {...selectedIspDept, promotion_id: selectGradeClasse}
        setLoading(true)
        await api(cookies).put(`/isp_stage/isp-dept-mapping/${selectedIspDept.id}/`, _values)
        setLoading(false)
        onClose()
        showMe()
    }

    return <>
                   <div>
            <h1>Dept Mapping List</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="min-w-full border border-gray-300">
                <div className="bg-gray-100 flex w-full">
                    <div className="px-4 py-2 border w-[50%]">IspDpt</div>
                    <div className="px-4 py-2 border w-[50%]">MappedBy</div> 
                </div>
                <div>
                    {deptMappings.map((p: any) => (
                    <div key={p.id} onClick={() => {
                        setSelectedIspDept(p)
                    }} className='cursor-pointer flex w-full'>
                        <div className="px-4 py-2 border w-[50%]">{p.libelle}</div>
                        <div className="px-4 py-2 border w-[50%]">{p.promotion?.libelle} - {p.promotion?.grade?.libelle}</div> 
                    </div>
                    ))}
                </div>
                </div>
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
        <Modal  isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <ModalContent>
                <ModalHeader>
                <h1 className='font-semibold text-[20px] m-0'>Add Dept Mapping</h1>
            </ModalHeader>
            <ModalBody>
                <p>{selectedIspDept?.libelle}</p>
                <SearchSelected  onChange={(e: any) => setSelectGradeClasse(e.id)} label='Departement' render={(e: any) => (`${e.libelle} - ${e.grade.libelle}`)} index='id' url='/uscitech_academy/promotions/' />
            </ModalBody>
            <ModalFooter>
                <button className='px-3 py-1 border rounded' onClick={onClose}>Annuler</button>
                { selectGradeClasse !== null && <button className='px-3 py-1 border rounded' onClick={updateIspDeptMapping}>Add</button>}
            </ModalFooter>
            </ModalContent>
        </Modal>
    </>
}