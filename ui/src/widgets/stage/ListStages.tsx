'use client'
import React from 'react'
import { Pagination, Spinner } from "@nextui-org/react";
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies';
import { PrinterIcon, SearchIcon, TableIcon } from 'lucide-react';
import useEvent from '@/lib/hooks/useEvent';
import FilterStages from '../FilterStages'; 
import { PageProps } from '@/lib/shared/types/config';
import ListStageForDeptResearcher from './list_stage/ListStageForDeptResearcher';
import ListStageForStageMaster from './list_stage/ListStageForStageMaster';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Grade } from '/addons/uscitech_academy/ui/src/types';
import { Input } from '@/components/ui/input';
import AddStage from './AddStage'; 

export interface QuoteObject {
  stage: number,
  carnet: number,
  rapport: number,
  regularite: number,
  tenue: number,
  carnet_stage: number,
  lecon: number,
  rapport_stage: number,
  defense_rapport: number,
  seminaire: number,
  stage_master: number,
  soutenance: number,
  lecture: number,
  central_total: number,
  central_moyenne: number
}

export interface QuoteField {
  index:string
  label: string
  max: number
  stage:"pedagogique"|"impregnation"|"entreprise"
  type: "value"|"function"
  callback?: (e: QuoteObject)=> any
}


export const centralisatriceFields : QuoteField[] = [
  {
      index:"seminaire",
      label: "Seminaire de Stage A",
      max: 20,
      stage:"pedagogique",
      type:"value"
  },
  {
      index:"stage_master",
      label: "Maitre de Stage B",
      max: 40,
      stage:"pedagogique",
      type:"function",
      callback: (quote: QuoteObject) => (parseInt(`${quote.stage}`)+ parseInt(`${quote.carnet}`) + parseInt(`${quote.rapport}`))/4
  },
  {
      index:"soutenance",
      label: "Soutenance D",
      max: 20,
      stage:"pedagogique",
      type:"value"
  },
  {
      index:"lecture",
      label: "Lecture Documents E",
      max: 20,
      stage:"pedagogique",
      type:"value"
  },
  {
      index:"central_total",
      label: "Total Général",
      max: 100,
      stage:"pedagogique",
      type:"function",
      callback: (quote : QuoteObject) => parseInt(`${quote.seminaire}`) + parseInt(`${quote.stage_master}`) + parseInt(`${quote.soutenance}`) + parseInt(`${quote.lecture}`)
  },
  {
      index:"central_moyenne",
      label: "Moyenne",
      max: 20,
      stage:"pedagogique",
      type:"function",
      callback: (quote : QuoteObject) => (parseInt(`${quote.seminaire}`) + ((parseInt(`${quote.stage}`) + parseInt(`${quote.carnet}`) + parseInt(`${quote.rapport}`))/4) + parseInt(`${quote.soutenance}`) + parseInt(`${quote.lecture}`))/5
  }
]


export const quoteFields : QuoteField[] = [
    {
      index:"stage",
      label: "Stage",
      max: 120,
      stage:"entreprise",
      type:"value"
  },
  {
      index:"stage",
      label: "Stage",
      max: 120,
      stage:"pedagogique",
      type:"value"
  },
  {
      index:"carnet",
      label: "Carnet",
      max: 30,
      stage:"pedagogique",
      type:"value"
  },
  {
      index:"rapport",
      label: "Rapport",
      max: 10,
      stage:"pedagogique",
      type:"value"
  },
  {
      index:"total",
      label: "Total",
      max: 160,
      stage:"pedagogique",
      type:"function",
      callback: (quote: QuoteObject)=> parseInt(`${quote.stage}`) + parseInt(`${quote.carnet}`) + parseInt(`${quote.rapport}`)
  },
  {
      index:"moyenne",
      label: "Moyenne",
      max: 40,
      stage:"pedagogique",
      type:"function",
      callback: (quote: QuoteObject)=> (parseInt(`${quote.stage}`) + parseInt(`${quote.carnet}`) + parseInt(`${quote.rapport}`))/4
  },
  {
      index:"regularite",
      label: "Régularité",
      max: 10,
      stage:"impregnation",
      type:"value"
  },
  {
      index:"tenue",
      label: "Tenue",
      max: 10,
      stage:"impregnation",
      type:"value"
  },
  {
      index:"carnet_stage",
      label: "Carnet de Stage",
      max: 10,
      stage:"impregnation",
      type:"value"
  },
  {
      index:"lecon",
      label: "Leçon",
      max: 20,
      stage:"impregnation",
      type:"value"
  },
  {
      index:"rapport_stage",
      label: "Rapport",
      max: 20,
      stage:"impregnation",
      type:"value"
  },
  {
      index:"defense_rapport",
      label: "Défense Rapport",
      max: 20,
      stage:"impregnation",
      type:"value"
  },
  {
      index:"total",
      label: "Total",
      max: 100,
      stage:"impregnation",
      type:"function",
      callback: (quote: QuoteObject)=> (parseInt(`${quote.regularite}`) + parseInt(`${quote.tenue}`) + parseInt(`${quote.carnet_stage}`) + parseInt(`${quote.lecon}`) + parseInt(`${quote.rapport_stage}`) + parseInt(`${quote.defense_rapport}`))
  },
  {
      index:"moyenne-peda",
      label: "Moyenne",
      max: 20,
      stage:"impregnation",
      type:"function",
      callback: (quote: QuoteObject)=> (parseInt(`${quote.regularite}`) + parseInt(`${quote.tenue}`) + parseInt(`${quote.carnet_stage}`) + parseInt(`${quote.lecon}`) + parseInt(`${quote.rapport_stage}`) + parseInt(`${quote.defense_rapport}`))/5
  }
]

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

    if (eventId === `list-stage-pedagogique-updated`){
      load(page)
    }
  }, [`new-stage-added-${props.stage}`, `list-stage-pedagogique-updated`])

  const onSubmitQuotes = async () => {
    try {
      await api(cookies).get(`/isp_stage/stage-master/submit-quotes/${props.grade !== undefined ? `?dept${props.grade?.id}` : ""}&stage=${props.stage}`)
      window.location.reload()
    } catch (e) {

    }
  }

  return (
    <>
      <div className='bg-transparent'>
        <div className='flex flex-wrap border-b border-inherent divide-x-[1px]'>
          <Link href={`/apps/isp_stage/${props.stage}/list`} className={`duration-300 cursor-pointer px-[15px] py-[5px] border-b-[3px] ${props.params.app[3] === "list" ? "font-bold  border-b-primary text-primary text-[13px]" : "text-gray-500  text-[12px] font-normal border-transparent"}`}>
            <p>Listes</p>
          </Link>
          <Link href={`/apps/isp_stage/${props.stage}/cotations`} className={`duration-300 cursor-pointer px-[15px] py-[5px] border-b-[3px] ${props.params.app[3] === "cotations" ? "font-bold  border-b-primary text-primary text-[13px]" : "text-gray-500  text-[12px] font-normal border-transparent"}`}>
            <p>Cotations</p>
          </Link>
          {
            (props.stage === "pedagogique" && props.user.permissions.find((p: string) => p === "isp_departement_officier") )&& <Link href={`/apps/isp_stage/${props.stage}/fiche-centralisatrice`} className={`duration-300 cursor-pointer px-[15px] py-[5px] border-b-[3px] ${props.params.app[3] === "fiche-centralisatrice" ? "font-bold  border-b-primary text-primary text-[13px]" : "text-gray-500  text-[12px] font-normal border-transparent"}`}>
              <p>Fiche Centralisatrice</p>
            </Link>
          }

        </div>
      </div>
      <div>

        <div className='bg-white rounded p-[0px] pb-[20px]'>
          <div className='flex items-center gap-[7px]'>
            <div className='flex flex-1 items-center p-[10px] bg-[rgba(0,0,0,0.0)] rounded border-b border-gray-600'>
              <Input className="border-0 flex-1 px-[20px] text-[14px] outline-none bg-transparent" id="search-student" placeholder='Recherche' onKeyUp={e => {
                if (e.keyCode === 13) handleSearch()
              }} />
              <div>
                <SearchIcon className='cursor-pointer' size={"14px"} onClick={handleSearch} />
              </div>
            </div>
            {
              props.user.permissions.find((p: string) => p === "isp_departement_officier") !== undefined && <AddStage promotion={props.promotion} promotions={props.promotions} stage={props.stage} />
            }
            <FilterStages {...props} selectedFilter={selectedFilter} onChange={setSelectedFilter} />
            <div className='flex gap-[5px]'>
              {
                (props.user.permissions.find((per: string) => per === "isp_user_stage_master" || per === "isp_departement_officier") || props.user.is_superuser === true) &&
                <Link href={`/apps/isp_stage/${props.stage}/${props.params.app[3]}/${props.grade?.id}/printing`}><Button><PrinterIcon size={"15px"} /></Button></Link>
              }
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
                (props.user.permissions.find((p: string) => p === "isp_departement_officier") && props.params.app[3] === "list") ? <>
                  <ListStageForDeptResearcher {...props} stages={stages} stagemaster={props.stagemaster} />
                </> : <>
                  {
                    props.params.app[3] === "fiche-centralisatrice" && props.user.permissions.find((p: string) => p === "isp_departement_officier") ?  <ListStageForStageMaster {...props}  stages={stages} stagemaster={props.stagemaster} quoteFields={centralisatriceFields} /> : 
                    <ListStageForStageMaster {...props} stages={stages} stagemaster={props.stagemaster} quoteFields={quoteFields} />
                  }
                 
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
