'use client'
import React from 'react'
import { FileDown, FileSpreadsheet, Printer, RotateCcw } from 'lucide-react'
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies'
import ListView, { ListViewLoadData } from '@/components/ListView'
import { PageProps } from '@/lib/shared/types/config'

interface Option {
    id: string
    libelle: string
    grade?: { id: string; libelle: string }
}

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

const SELECT_CLASS =
    'text-[13px] text-gray-600 bg-white border border-gray-200 rounded px-[10px] py-[6px] outline-none focus:border-primary min-w-[180px]'

interface Props extends PageProps {}

export default function ListMemoireDepots(props: Props) {
    const [total, setTotal] = React.useState(0)

    // Options des filtres (limitées au périmètre de l'utilisateur côté API)
    const [sections, setSections] = React.useState<Option[]>([])
    const [departments, setDepartments] = React.useState<Option[]>([])

    // Filtres actifs
    const [sectionId, setSectionId] = React.useState('')
    const [departmentId, setDepartmentId] = React.useState('')
    const [status, setStatus] = React.useState('')
    const [search, setSearch] = React.useState('')

    const [exporting, setExporting] = React.useState<'' | 'excel' | 'pdf'>('')
    const [error, setError] = React.useState('')

    React.useEffect(() => {
        api(cookies)
            .get('/isp_stage/memoire-depots/filters/')
            .then((res) => {
                setSections(res.data?.sections || [])
                setDepartments(res.data?.departments || [])
            })
            .catch(() => setError('Impossible de charger les filtres.'))
    }, [])

    // Départements proposés : ceux de la section choisie, sinon tous
    const visibleDepartments = React.useMemo(
        () => (sectionId ? departments.filter((d) => d.grade?.id === sectionId) : departments),
        [departments, sectionId],
    )

    const onChangeSection = (value: string) => {
        setSectionId(value)
        // Le département sélectionné n'appartient peut-être plus à la section
        setDepartmentId((current) => {
            if (!current || !value) return current
            const dept = departments.find((d) => d.id === current)
            return dept && dept.grade?.id === value ? current : ''
        })
    }

    const resetFilters = () => {
        setSectionId('')
        setDepartmentId('')
        setStatus('')
    }

    const hasFilters = sectionId !== '' || departmentId !== '' || status !== ''

    // Filtres transmis à la liste — et repris à l'identique par les exports,
    // pour que le document produit corresponde à ce qui est affiché.
    const filters = { section: sectionId, department: departmentId, status }

    const buildExportQuery = () => {
        const query = new URLSearchParams()
        if (sectionId) query.set('section', sectionId)
        if (departmentId) query.set('department', departmentId)
        if (status) query.set('status', status)
        if (search) query.set('search', search)
        const qs = query.toString()
        return qs ? `?${qs}` : ''
    }

    const download = async (kind: 'excel' | 'pdf') => {
        setError('')
        setExporting(kind)
        const isExcel = kind === 'excel'
        try {
            const response = await api(cookies).get(
                `/isp_stage/memoire-depots/${isExcel ? 'export-excel' : 'print'}/${buildExportQuery()}`,
                { responseType: 'blob' },
            )
            const blob = new Blob([response.data], {
                type: isExcel
                    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    : 'application/pdf',
            })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = isExcel ? 'depots-memoires.xlsx' : 'depots-memoires.pdf'
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (e) {
            setError("L'export a échoué. Veuillez réessayer.")
        } finally {
            setExporting('')
        }
    }

    const onLoaded = (data: ListViewLoadData) => setTotal(data.count)

    return (
        <div className="border-t border-inherent mt-[15px] pt-[15px] h-full">
            <div className="flex flex-col md:flex-row md:items-start gap-[10px] mb-[10px]">
                <div className="flex flex-col flex-1">
                    <p className="font-semibold text-[20px] m-0">Dépôts de mémoire</p>
                    <p className="text-[13px] text-gray-400">
                        {props.user.is_superuser ? 'Tous les départements' : 'Votre département'} ·{' '}
                        {total} dépôt{total > 1 ? 's' : ''}
                        {hasFilters ? ' (filtré)' : ''}
                    </p>
                </div>
                <div className="flex gap-[8px] items-center">
                    <button
                        type="button"
                        onClick={() => download('excel')}
                        disabled={exporting !== ''}
                        className="flex items-center gap-[6px] text-[13px] text-gray-700 bg-gray-100 hover:bg-gray-200 rounded py-[7px] px-[14px] disabled:opacity-50"
                    >
                        <FileSpreadsheet size={15} />
                        {exporting === 'excel' ? 'Export…' : 'Excel'}
                    </button>
                    <button
                        type="button"
                        onClick={() => download('pdf')}
                        disabled={exporting !== ''}
                        className="flex items-center gap-[6px] text-[13px] text-white bg-primary/80 hover:bg-primary rounded py-[7px] px-[14px] disabled:opacity-50"
                    >
                        <Printer size={15} />
                        {exporting === 'pdf' ? 'Impression…' : 'Imprimer (PDF)'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-[10px] bg-[rgba(0,0,0,0.02)] rounded p-[12px] mb-[10px]">
                <div className="flex flex-col gap-[4px]">
                    <label className="text-[11px] uppercase text-gray-400">Section</label>
                    <select
                        value={sectionId}
                        onChange={(e) => onChangeSection(e.target.value)}
                        className={SELECT_CLASS}
                    >
                        <option value="">Toutes les sections</option>
                        {sections.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.libelle}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-[4px]">
                    <label className="text-[11px] uppercase text-gray-400">Département</label>
                    <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className={SELECT_CLASS}
                    >
                        <option value="">Tous les départements</option>
                        {visibleDepartments.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.libelle}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-[4px]">
                    <label className="text-[11px] uppercase text-gray-400">Statut</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={SELECT_CLASS}
                    >
                        <option value="">Tous les statuts</option>
                        {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {hasFilters && (
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="flex items-center gap-[6px] text-[13px] text-gray-500 hover:text-gray-700 py-[7px] px-[10px]"
                    >
                        <RotateCcw size={14} /> Réinitialiser
                    </button>
                )}
            </div>

            {error ? <p className="text-[13px] text-red-500 mb-[10px]">{error}</p> : null}

            <ListView
                {...props}
                className="p-0"
                breadcrumb={[]}
                showBreadcrumb={false}
                showTitle={false}
                padding={false}
                onLoaded={onLoaded}
                filters={filters}
                onSearch={setSearch}
                url="/isp_stage/memoire-depots/"
                title=""
                subtitle={(rows: MemoireDepot[]) => `${rows.length} dépôts`}
                renderColumns={() => (
                    <div className="sm:flex hidden gap-[5px] font-light my-[3px] w-full text-sm text-gray-500 px-[20px]">
                        <p className="w-[24%]">Étudiant</p>
                        <p className="w-[13%]">Téléphone</p>
                        <p className="w-[18%]">Section</p>
                        <p className="w-[18%]">Département</p>
                        <p className="w-[12%]">Statut</p>
                        <p className="w-[15%] text-right">Fichier</p>
                    </div>
                )}
                renderRow={(item: MemoireDepot) => {
                    const st = STATUS_LABELS[item.status] || STATUS_LABELS.nouveau
                    return (
                        <div
                            key={item.id}
                            className="flex flex-col sm:flex-row gap-[5px] text-[13px] text-gray-600 px-[20px] py-[10px] my-[2px] w-full border-b border-gray-100 hover:bg-gray-50"
                        >
                            <div className="w-full sm:w-[24%]">
                                <p className="font-medium text-gray-700">{item.full_name}</p>
                                {item.subject ? (
                                    <p className="text-[11px] text-gray-400 truncate">{item.subject}</p>
                                ) : null}
                            </div>
                            <p className="w-full sm:w-[13%]">{item.phone}</p>
                            <p className="w-full sm:w-[18%]">{item.section?.libelle || '--'}</p>
                            <p className="w-full sm:w-[18%]">{item.department?.libelle || '--'}</p>
                            <div className="w-full sm:w-[12%]">
                                <span className={`inline-block rounded px-2 py-[2px] text-[11px] font-medium ${st.className}`}>
                                    {st.label}
                                </span>
                            </div>
                            <div className="w-full sm:w-[15%] flex sm:justify-end">
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
