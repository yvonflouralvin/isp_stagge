'use client'
import { Button } from "@/components/ui/button";
import { PageProps } from "@/lib/shared/types/config";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    DropdownSection
} from "@nextui-org/dropdown";
import { FilterIcon } from "lucide-react";
import React from "react";

interface Props extends PageProps {
    onChange: (e: { cotation: string, assignation: string, dept: string }) => any,
    selectedFilter: any
    filtering_promotions: any[]
}
export default function FilterStages(props: Props) {

    const labels = [
        { key: "all", label: "Tous afficher" },
        { key: "assigned", label: "Assignés" },
        { key: "notassigned", label: "Non assigés" },
    ]

    const labels_cotations = [
        { key: "all", label: "Tous afficher" },
        { key: "assigned", label: "Cotés" },
        { key: "notassigned", label: "Non cotés" },
    ]

    if (props.user.permissions.find((pr: string) => pr === "isp_departement_officier") || props.user.is_superuser === true) {
        return <Dropdown>
            <DropdownTrigger>
                <Button variant={"outline"}> <FilterIcon size={"14px"} /> Filtrer </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions" onChange={e => console.log(e)}>
                <DropdownSection showDivider title="Par assignation">
                    {
                        labels.map(label => {
                            return <DropdownItem onClick={() => props.onChange({ ...props.selectedFilter, assignation: label.key })} className={` ${props.selectedFilter.assignation === label.key ? "font-bold bg-gray-300" : ""} `} key={label.key}>{label.label}</DropdownItem>
                        })
                    }
                </DropdownSection>
                <DropdownSection showDivider title="Par cote">
                    {
                        labels_cotations.map(label => {
                            return <DropdownItem onClick={() => props.onChange({ ...props.selectedFilter, cotation: label.key })} className={` ${props.selectedFilter.cotation === label.key ? "font-bold bg-gray-300" : ""} `} key={label.key}>{label.label}</DropdownItem>
                        })
                    }
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    }
    return <Dropdown>
        <DropdownTrigger>
            <Button variant={"outline"}> <FilterIcon size={"14px"} /> Filtrer </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions" onChange={e => console.log(e)}>
        <DropdownSection showDivider title="Par cote">
            {
                labels_cotations.map(label => {
                    return <DropdownItem onClick={() => props.onChange({ ...props.selectedFilter, cotation: label.key })} className={` ${props.selectedFilter.cotation === label.key ? "font-bold bg-gray-300" : ""} `} key={label.key}>{label.label}</DropdownItem>
                })
            }
        </DropdownSection>
        <DropdownSection showDivider title="Par département">
            {
                [ {libelle: "Tous les départements", id:"all"}, ...props.filtering_promotions].map((label: any) => {
                    return <DropdownItem onClick={() => props.onChange({ ...props.selectedFilter, dept: label.id })} className={` ${props.selectedFilter.dept === label.id ? "font-bold bg-gray-300" : ""} `} key={label.id}>{label.libelle}</DropdownItem>
                })
            }
        </DropdownSection>
        </DropdownMenu>
    </Dropdown>
}   