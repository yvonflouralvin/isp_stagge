'use client'
import React from 'react'
import { FileDown } from 'lucide-react'
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies'
import ListView, { ListViewLoadData } from '@/components/ListView'
import { PageProps } from '@/lib/shared/types/config'

interface MemoireDepot {
    id: string
    full_name: string
    phone: string
    subject?: string
    file_url?: string
    status: string
    created_at: string
    section?: { id: string; libelle: string }
    department?: { id: string; libelle: string }
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    nouveau: { label: 'Nouveau', className: 'bg-blue-50 text-blue-600' },
    consulte: { label: 'Consulté', className: 'bg-gray-100 text-gray-600' },
    valide: { label: 'Validé', className: 'bg-green-50 text-green-600' },
    rejete: { label: 'Rejeté', className: 'bg-red-50 text-red-600' },
}

interface Props extends PageProps {}

export default function ListMemoireDepots(props: Props) {
    const [total, setTotal] = React.useState(0)

    const onLoaded = (data: ListViewLoadData) => setTotal(data.count)

    return (
        <div className="border-t border-inherent mt-[15px] pt-[15px] h-full">
            <div className="flex items-start mb-[10px]">
                <div className="flex flex-col flex-1">
                    <p className="font-semibold text-[20px] m-0">Dépôts de mémoire</p>
                    <p className="text-[13px] text-gray-400">
                        {props.user.is_superuser
                            ? 'Tous les départements'
                            : 'Votre département'}{' '}
                        · {total} dépôt{total > 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            <ListView
                {...props}
                className="p-0"
                breadcrumb={[]}
                showBreadcrumb={false}
                showTitle={false}
                padding={false}
                onLoaded={onLoaded}
                url="/isp_stage/memoire-depots/"
                title=""
                subtitle={(rows: MemoireDepot[]) => `${rows.length} dépôts`}
                renderColumns={() => (
                    <div className="sm:flex hidden gap-[5px] font-light my-[3px] w-full text-sm text-gray-500 px-[20px]">
                        <p className="w-[26%]">Étudiant</p>
                        <p className="w-[16%]">Téléphone</p>
                        <p className="w-[22%]">Département</p>
                        <p className="w-[16%]">Statut</p>
                        <p className="w-[20%] text-right">Fichier</p>
                    </div>
                )}
                renderRow={(item: MemoireDepot) => {
                    const st = STATUS_LABELS[item.status] || STATUS_LABELS.nouveau
                    return (
                        <div
                            key={item.id}
                            className="flex flex-col sm:flex-row gap-[5px] text-[13px] text-gray-600 px-[20px] py-[10px] my-[2px] w-full border-b border-gray-100 hover:bg-gray-50"
                        >
                            <div className="w-full sm:w-[26%]">
                                <p className="font-medium text-gray-700">{item.full_name}</p>
                                {item.subject ? (
                                    <p className="text-[11px] text-gray-400 truncate">{item.subject}</p>
                                ) : null}
                            </div>
                            <p className="w-full sm:w-[16%]">{item.phone}</p>
                            <p className="w-full sm:w-[22%]">{item.department?.libelle || '--'}</p>
                            <div className="w-full sm:w-[16%]">
                                <span className={`inline-block rounded px-2 py-[2px] text-[11px] font-medium ${st.className}`}>
                                    {st.label}
                                </span>
                            </div>
                            <div className="w-full sm:w-[20%] flex sm:justify-end">
                                {item.file_url ? (
                                    <a
                                        href={item.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-[6px] text-primary hover:underline"
                                    >
                                        <FileDown size={14} /> Télécharger
                                    </a>
                                ) : (
                                    '--'
                                )}
                            </div>
                        </div>
                    )
                }}
            />
        </div>
    )
}
