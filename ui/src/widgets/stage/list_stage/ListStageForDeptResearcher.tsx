import { PageProps } from "@/lib/shared/types/config";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import QuoteField from "./QuoteField";
import { StageMaster } from "../../../types";

interface Props extends PageProps {
    stages: any[]
    onClickItem?: (e: any) => any
}

export default function ListStageForDeptResearcher(props: Props) {
    return <>
        <Table className='shadow-0' shadow='none'>
            <TableHeader>
                <TableColumn>Nom</TableColumn>
                <TableColumn>Postnom</TableColumn>
                <TableColumn>Facture</TableColumn>
                <TableColumn>Maitre de Stage</TableColumn>
                <TableColumn>Cote</TableColumn>
            </TableHeader>
            <TableBody>
                {
                    props.stages.map(stage => {
                        var stage_master = ``
                        stage.stagemaster.map((sm:StageMaster)=>{
                            if(stage_master !== ``) stage_master = `, `
                            stage_master = `${sm.employee?.fullname}`
                        })
                        return (
                            <TableRow className='duration-300 hover:bg-[rgba(0,0,0,0.03)]' aria-labelledby={`${stage.id}`} aria-label={`${stage.id}`} key={stage.id} onClick={() => {
                                props.onClickItem && props.onClickItem(stage)
                            }
                            }>
                                <TableCell>{stage.student.user?.name}</TableCell>
                                <TableCell>{stage.student.user?.last_name}</TableCell>
                                <TableCell>{stage.facture}</TableCell>
                                <TableCell>{stage_master}</TableCell>
                                <TableCell> {stage.quote_status !== "submitted" ? "---" : `${stage.quote}`}</TableCell>
                            </TableRow>
                        )
                    })
                }
            </TableBody>
        </Table>
    </>
}