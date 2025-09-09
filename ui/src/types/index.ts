import {
    Grade,
    Student
} from '/addons/uscitech_academy/ui/src/types' 
import {
    Employee
} from '/addons/hr/ui/src/types'
import { PageProps } from '@/lib/shared/types/config'

export type ProjetTutore =  {
    id: string
    subject: string
    director?: DirecteurTravaux
    head_id: string
    director_id: string
    head: Student
    member: string[]
    member_names: string[]
}

export interface StudentMemoire {
    id: string
    subject: string
    director?: DirecteurTravaux
    student: Student
    director_id: string
    student_id: string
}

export interface StudentMemoireFormPageProps extends PageProps {
    for: "create"|"detail"
    memoire?: StudentMemoire
    student?: Student
}

export interface ProjetTutoreFormPageProps extends PageProps {
    for: "create"|"detail"
    members: Student[]
    projet?: ProjetTutore
    student?: Student
    department_settings?: DepartmentSettings
}

export interface DepartmentSettings {
    id: string
    department: Grade
    department_id: string
    max_teacher_tutore_project_group: number
    max_teacher_memoire: number
    max_tutore_project_member_group: number
    max_teacher_externe_tutore_project_group: number
    max_teacher_externe_memoire: number
}


export interface DepartmentOfficier {
    id: string
    employee : Employee
    dept: Grade
    employee_id: string
    dept_id: string
}

export interface StageMaster {
    id: string
    employee : Employee 
    employee_id: string 
    is_quote_submitted: boolean
}

export interface DirecteurTravaux {
    id: string
    employee : Employee 
    employee_id: string 
    department: Grade
    department_id : string
    direction_type: "projet-tutore" | "memoire" | "stage"
    category: "interne" | "externe"
}



export interface DirecteurTravauxResumes {
    department: Grade
    quota: {
        max_tutore_projects_interne: number
        max_externe_tutore_projects: number
        max_memoire_projects_interne: number
        max_externe_memoire_projects: number
    }
    used: {
        used_tutore_projects_interne: number
        used_tutore_projects_externe: number
        used_memoire_projects_interne: number
        used_memoire_projects_externe: number
    }
    directeurs: DirecteurTravaux[]
}


