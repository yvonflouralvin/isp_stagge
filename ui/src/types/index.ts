import {
    Grade,
    Student,
    Teacher
} from '/addons/uscitech_academy/ui/src/types'
import { User } from "@/lib/shared/types"
import {
    Employee
} from '/addons/hr/ui/src/types'
import { PageProps } from '@/lib/shared/types/config'

export type ProjetTutore =  {
    id: string
    subject: string
    teacher?: Teacher
    head_id: string
    teacher_id: string
    head: Student
    member: string[]
}

export interface StudentMemoire {
    id: string
    subject: string
    teacher?: Teacher
    student: Student
    teacher_id: string
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
}