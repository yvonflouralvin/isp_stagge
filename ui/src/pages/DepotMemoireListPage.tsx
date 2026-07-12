import React from 'react'
import { PageProps } from '@/lib/shared/types/config'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ListMemoireDepots from '../widgets/memoire-depot/ListMemoireDepots'

export default async function DepotMemoireListPage(props: PageProps) {
    return (
        <div className="flex w-full h-full flex-col bg-white rounded shadow p-[5px] md:p-[20px]">
            <Breadcrumb
                links={[
                    {
                        label: 'Dépôts de mémoire',
                        link: '/apps/isp_stage/depots-memoires',
                    },
                ]}
            />
            <ListMemoireDepots {...props} />
        </div>
    )
}
