'use client'
import React from 'react'
import { Pagination, Spinner } from "@nextui-org/react";
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies';
import { ListIcon, SearchIcon, SheetIcon, TableIcon } from 'lucide-react';
import useEvent from '@/lib/hooks/useEvent';
import FilterStages from '../FilterStages';
import PermissionComponent from '@/components/ui/PermissionComponent';
import AddStage from './AddStage';
import PrintReport from './PrintReport';
import { PageProps } from '@/lib/shared/types/config';
import ListStageForDeptResearcher from './list_stage/ListStageForDeptResearcher';
import ListStageForStageMaster from './list_stage/ListStageForStageMaster';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Grade } from '/addons/uscitech_academy/ui/src/types';

interface Props extends PageProps {
  stage: string,
  promotions: any,
  promotion: any,
  user: any, 
  filtering_promotions: any[]
  stagemaster: any
  grade?: Grade
}
export default function ListStages(props: Props) {


  const [selectedFilter, setSelectedFilter] = React.useState<{ cotation: string, assignation: string, dept: string }>({
    cotation: "all",
    assignation: "all",
    dept: props.grade ? props.grade.id : "all"
  })

  const [stages, setStages] = React.useState<any[]>([])
  const [total_pages, setTotal_pages] = React.useState(0);
  const [count, setCount] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [isLoadingDatas, setIsLoadingDatas] = React.useState(false);
  const [searchParams, setSearchParams] = React.useState("")

  // label.key

  const load = async (pageNumber: number) => {
    setIsLoadingDatas(true)
    api(cookies).get(`/isp_stage/student/${props.stage}?page=${pageNumber}${searchParams}&page_size=30&filter_assignation=${selectedFilter.assignation}&filter_cotation=${selectedFilter.cotation}&filter_dept=${selectedFilter.dept}`)
      .then(result => {
        setStages(result.data.results)
        setTotal_pages(result.data.total_pages)
        setCount(result.data.count)
        setIsLoadingDatas(false)
      })
      .catch(error => {
        console.error(error)
        setIsLoadingDatas(false)
      })
  }

  React.useEffect(() => {
    load(page);
  }, [page])

  React.useEffect(() => {
    if (searchParams !== "") {
      setPage(1);
      load(1);
    }
  }, [searchParams, selectedFilter])

  React.useEffect(() => {
    setPage(1);
    load(1);
  }, [selectedFilter])

  const handleSearch = () => {
    const search_student: any = document.getElementById("search-student");
    if (search_student.value === "") {
      setSearchParams("");
      setPage(1);
      load(1);
    }
    setSearchParams(`&search=${search_student.value}`)
  }

  const { } = useEvent((eventId: string, payload: any) => {
    if (eventId === `new-stage-added-${props.stage}`) {
      setPage(total_pages)
      load(total_pages)
    }
  }, [`new-stage-added-${props.stage}`])

  const onSubmitQuotes = async () => {
    try {
      await api(cookies).get(`/isp_stage/stage-master/submit-quotes/${props.grade !== undefined ? `?dept${props.grade?.id}` : ""}`)
      window.location.reload()
    } catch (e) {

    }
  }

  const stageInfos = () => {
    const stageTypes = [
      { id: 'impregnation', label: "Imprégnation", promotion: "/isp_stage/promotions-l2" },
      { id: 'pedagogique', label: 'Pédagogique', promotion: "/isp_stage/promotions-l3" },
      { id: 'entreprise', label: 'Entreprise', promotion: "/isp_stage/promotions-l3" }
    ]

    return stageTypes.find(st => st.id === props.params.app[2])
  }

  const router = useRouter()
  const onClickItem = (e: any) => {
    router.push(`/apps/isp_stage/${props.params.app[2]}/${e.id}`)
}

  return (
    <>
      <div className='bg-transparent'>
        <div className='flex flex-wrap border-b border-inherent divide-x-[1px]'>
          <Link href={`/apps/isp_stage/${props.stage}/list`} className={`duration-300 cursor-pointer px-[15px] py-[5px] border-b-[3px] ${props.params.app[3] === "list" ? "font-bold  border-b-primary text-primary text-[13px]" : "text-gray-500  text-[12px] font-normal border-transparent"}`}>
              <p className=''>Listes</p>
          </Link> 
          <Link href={`/apps/isp_stage/${props.stage}/cotations`} className={`duration-300 cursor-pointer px-[15px] py-[5px] border-b-[3px] ${props.params.app[3] === "cotations" ? "font-bold  border-b-primary text-primary text-[13px]" : "text-gray-500  text-[12px] font-normal border-transparent"}`}>
              <p className=''>Cotations</p>
          </Link> 
        </div>
      </div>
      <div className=''>

        <div className='bg-white rounded p-[0px] pb-[20px]'>
          <div className='flex items-center gap-[7px]'>
            <div className='flex flex-1 items-center p-[10px] bg-[rgba(0,0,0,0.07)] rounded'>
              <input className="border-0 flex-1 px-[20px] text-[14px] outline-none bg-transparent" id="search-student" placeholder='Recherche' onKeyUp={e => {
                if (e.keyCode === 13) handleSearch()
              }} />
              <div>
                <SearchIcon className='cursor-pointer' size={"14px"} onClick={handleSearch} />
              </div>
            </div>
            <FilterStages {...props} selectedFilter={selectedFilter} onChange={setSelectedFilter} />
            <div className='flex gap-[5px]'>
              <PermissionComponent
                user={props.user}
                children={<PrintReport report={
                  `${props.user.permissions.find((p: string) => p === "isp_user_stage_master") ? "stagemaster_students" : ""}${props.user.permissions.find((p: string) => p === "isp_departement_officier") ? "dept_chief_stage_students" : ""}`
                } datas={{ stage: props.stage }} />}
                permissions={["isp_user_stage_master", "isp_departement_officier"]}
              />

            </div>
            {
              (props.params.app[3] === "cotations" && props.stagemaster !== undefined) && <div>
                {
                  props.stagemaster.is_quote_submitted === false &&
                  <>
                    <Button onClick={onSubmitQuotes}>Soumettre <TableIcon color='white' size={13} /></Button>
                  </>
                }
              </div>
            }
          </div>
          {
            isLoadingDatas ? <div className='flex flex-col items-center justify-center min-h-[400px]'>
              <Spinner />
              <p>Chargement...</p>
            </div> : <>
              {
                (props.user.permissions.find((p: string) => p === "isp_departement_officier") && props.params.app[3] === "list")  ? <>
                  <ListStageForDeptResearcher {...props} stages={stages} stagemaster={props.stagemaster} />
                </> : <>
                  <ListStageForStageMaster {...props} stages={stages} stagemaster={props.stagemaster} />
                </>
              }
            </>
          }
          <div className="px-[20px] mt-[10px] flex items-center gap-[10px]">
            {total_pages > 1 && <Pagination initialPage={1} total={total_pages} page={page} defaultValue={1} onChange={e => setPage(e)} />}- <p className="text-[12px] font-bold">{count} Enregistrement</p>
          </div>
        </div>

      </div>
    </>

  );
}
