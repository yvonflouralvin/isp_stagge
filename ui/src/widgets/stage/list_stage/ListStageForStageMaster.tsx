import { PageProps } from "@/lib/shared/types/config";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner, Input } from "@nextui-org/react";
import QuoteField from "./QuoteField";

interface Props extends PageProps {
    stages: any[]
    onClickItem?: (e: any) => any
}


export default function ListStageForStageMaster(props: Props) {
    return <>
        <Table className='shadow-0' shadow='none'>
            <TableHeader>
                <TableColumn>Nom</TableColumn>
                <TableColumn>Postnom</TableColumn>
                <TableColumn>Promotion</TableColumn>
                <TableColumn>Cote</TableColumn>
            </TableHeader>
            <TableBody>
                {
                    props.stages.map(stage => {
                        return (
                            <TableRow className='duration-300 hover:bg-[rgba(0,0,0,0.03)]' aria-labelledby={`${stage.id}`} aria-label={`${stage.id}`} key={stage.id} onClick={() => {
                                if (props.onClickItem && props.params.app[3] !== "cotations") props.onClickItem(stage)
                            }
                            }>
                                <TableCell>{stage.student.user?.name}</TableCell>
                                <TableCell>{stage.student.user?.last_name}</TableCell>
                                <TableCell>{stage.student?.promotion?.grade?.libelle}</TableCell>
                                <TableCell><QuoteField {...props} stage={stage} /></TableCell>
                            </TableRow>
                        )
                    })
                }
            </TableBody>
        </Table>
    </>
}