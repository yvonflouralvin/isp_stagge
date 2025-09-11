'use client'
import React from 'react'; 
import {  StudentMemoire } from '../../types'
import { PrinterIcon, FileDown } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/network/api';
import cookies from '@/lib/shared/cookies';
import TabView from '@/components/TabView'
import ListView, { ListViewLoadData } from '@/components/ListView'
import { PageProps } from '@/lib/shared/types/config';
import { Student } from '/addons/uscitech_academy/ui/src/types';

interface Props extends PageProps {

}
export default function ListStudentMemoires(props: Props) {

    const [selectedTab, setSelectedTab] = React.useState(1);
    const [totals, setTotals] = React.useState({list: 0, rest: 0, submitted: 0});

    return <div className='border-t border-inherent mt-[15px] pt-[15px] h-full'>
                <div className="flex items-start">
                    <div className='flex flex-col flex-1'>
                        <p className='font-semibold text-[20px] m-0'>Mémoires</p>
                        {/* <p className='text-[13px] text-gray-400'>{count} mémoires</p> */}
                    </div>
                </div>
                {
                    props.user.permissions.find((perm:string)=> perm === "isp_departement_officier") ?  <>
                    <TabView tabs={[
                        {key:1, label:`Liste Memoires ${totals.list >= 0 ? `(${totals.list})` : ""}`},
                        {key:2, label:`Etudiants Restants ${totals.rest >= 0 ? `(${totals.rest})` : ""}`},
                        {key:3, label:`Mémoires Soumis ${totals.submitted >= 0 ? `(${totals.submitted})` : ""}`}
                    ]} onChange={(e)=>setSelectedTab(Number(e))} />
    
                    <div className="mt-[10px]">
                        {  selectedTab === 1 && <ListMemoire {...props} onLoaded={(data)=> setTotals({...totals, list: data.count})}/>  } 
                        {  selectedTab === 2 && <ListStudentWithoutMemoire {...props} onLoaded={(data)=> setTotals({...totals, rest: data.count})}/> }
                        {  selectedTab === 3 && <ListAllSubmittedMemoire {...props} onLoaded={(data)=> setTotals({...totals, submitted: data.count})}/> }
                    </div>
    
                    </> : <>
                    <ListMemoire {...props} onLoaded={(data)=> setTotals({...totals, list: data.count})}/>
                </> 
                }

            </div>
}

interface ListMemoireProps extends Props {
    onLoaded: (data: ListViewLoadData) => any
}
const ListMemoire = (props: ListMemoireProps)=>{
    return  <ListView 
        {...props}
        className='p-0'
        breadcrumb={[]}
        renderRow={(student: StudentMemoire)=> {
            return <Link href={`/apps/isp_stage/students-memoires/${student.id}`} key={student.id} className="duration-300 flex gap-[2px] text-[13px] text-gray-500 px-[20px] py-[6px] my-[3px] cursor-pointer hover:bg-[0,0,0,0.02] w-full">
                        <p className="w-[50%]">{student.subject}</p> 
                        <p className="w-[25%]">{`${student.student.user.name} ${student.student.user.last_name} ${student.student.user.first_name}`}</p>
                        <p className="w-[25%]">{`${student.director ? student.director?.employee.fullname : "--"}`}</p>
                    </Link>
        }}
        subtitle={e => ``}
        title=''
        url='/isp_stage/students-memoires/'
        showBreadcrumb={false}
        padding={false}
        showTitle={false}
    />
}

interface ListStudentWithoutMemoireProps extends Props {
    onLoaded: (data: ListViewLoadData) => any
}
const ListStudentWithoutMemoire = (props: ListStudentWithoutMemoireProps)=>{
    return <div className='w-full'>
        <ListView 
        {...props}
        className='p-0'
        breadcrumb={[]}
        renderRow={(e: Student)=> {
            return <p>{e.user.name} {e.user.last_name} {e.user.first_name}</p>
        }}
        subtitle={e => ``}
        title=''
        url='/isp_stage/dept-recherche-officier/student_without_memoires/'
        showBreadcrumb={false}
        padding={false}
        showTitle={false}
    />
    <Link href={`/apps/isp_stage/students-memoires/printing/rest`} className='flex gap-[10px] mt-[10px]'>Imprimer <PrinterIcon size={"13px"}/></Link>
    </div>
}


interface ListAllSubmittedMemoireProps extends Props {
    onLoaded: (data: ListViewLoadData) => any
}

// Définir un type pour la soumission pour une meilleure autocomplétion
interface StudentMemoireSubmission {
    id: string;
    final_subject: string;
    submission_date: string;
    memoire: StudentMemoire; 
    submitter: Student;
}

const ListAllSubmittedMemoire = (props: ListAllSubmittedMemoireProps )=>{
    const [isExporting, setIsExporting] = React.useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await api(cookies).get(`/isp_stage/students-memoires-soumissions/export-excel/`, {
                responseType: 'blob', // Important pour recevoir un fichier
            });

            // Créer un lien temporaire pour déclencher le téléchargement
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'memoires-soumis.xlsx');
            document.body.appendChild(link);
            link.click();

            // Nettoyage
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Erreur lors de l'exportation Excel:", error);
            // Idéalement, afficher une notification à l'utilisateur ici
        } finally {
            setIsExporting(false);
        }
    };
    return  <>
    <div className='flex justify-end mb-2'>
        <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-2 px-4 rounded-lg disabled:opacity-50"
        >
            {isExporting ? 'Exportation...' : 'Exporter en Excel'}
            <FileDown size={16} />
        </button>
    </div>
    <ListView
        {...props}
        onLoaded={props.onLoaded}
        showBreadcrumb={false}
        breadcrumb={[]}
        showTitle={false}
        renderColumns={() => {
            return <div className="sm:flex hidden flex-col md:flex-row gap-[5px] font-light my-[3px] rounded w-full text-sm text-gray-500">
                <p className="w-full sm:w-[30%]">Etudiant</p>
                <p className="w-full sm:w-[50%]">Sujet Final</p>
                <p className="w-full sm:w-[20%]">Directeur</p> 
            </div>
        }}
        renderRow={(submission: StudentMemoireSubmission) => {
            // Les données viennent maintenant de l'objet `submission.projet`
            const memoire = submission.memoire;
            return <Link href={`/apps/isp_stage/students-memoires/${memoire.id}`} key={submission.id} className="duration-300 flex flex-col md:flex-row gap-[5px] text-[13px] text-gray-600 px-[20px] py-[8px] my-[3px] cursor-pointer hover:bg-gray-50 w-full border-b border-gray-100">
                <div className='w-full sm:w-[30%]'>
                    <p>{memoire.student.user.name} {memoire.student.user.last_name} {memoire.student.user.first_name}</p>
                </div>
                <p className="w-full sm:w-[50%] font-semibold">{submission.final_subject}</p>
                <p className='w-full sm:w-[20%]'>{`${memoire.director ? memoire.director?.employee.fullname : "--"}`}</p>
            </Link>
        }}
        subtitle={(submissions: StudentMemoireSubmission[]) => `${submissions.length} projets soumis`}
        title='Projets Tutorés Soumis'
        url={`/isp_stage/students-memoires-soumissions/`}
    />
</>
}
