from django.shortcuts import render , get_object_or_404
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import JsonResponse 
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from uscitech_academy.models import *

from rest_framework.permissions import IsAuthenticated
from .models import * 
from .serializers import *
from uscitech_academy.models import Student

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stages_resumes(request):
    stages = Stage.objects.all().exclude(student = None).exclude(student__user = None)
    students = Student.objects.all().exclude(user = None)
    
    user: User = request.user
    if user == None :
        return Response({
            "students": 0,
            "impregnations": 0 ,
            "pedagogiques": 0,
            "affected": 0,
            "error":"No user exist"
        })
    # print(user.pemissions)
    if user.is_superuser : 
        stages = Stage.objects.all().exclude(student = None).exclude(student__user = None)
    elif not user.is_superuser and user.has_perm('isp_stage.isp_departement_officier'):
        dept_off = DeptRechercheOfficier.objects.filter(employee__user__id=user.id)
        if dept_off.exists() :
            stages = Stage.objects.filter(student__promotion__grade__id=dept_off[0].dept.id)
            students = students.filter(promotion__grade__id=dept_off[0].dept.id)
    elif not user.is_superuser and not user.has_perm('isp_stage.isp_departement_officier') and user.has_perm('isp_stage.isp_user_stage_master'):
        stages = Stage.objects.filter(stagemaster__employee__user__id = user.id)
        students = students.filter(id__in = [stage.student.id for stage in stages])
    else :
        return Response({
            "students": 0,
            "impregnations": 0 ,
            "pedagogiques": 0,
            "affected": 0,
            "error":"We occure some error here"
        })

    return Response({
        "students": len(students),
        "impregnations": len(stages.filter(stage="impregnation")) ,
        "pedagogiques": len(stages.filter(stage="pedagogique")),
        "affected": len(stages.exclude(stagemaster=None))
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_reports(request):

    # 1. Rapport sur les Stages
    stages = Stage.objects.all()

    department_reports = []
    
    grade_classes = GradeClasse.objects.all()
    
    for grade in grade_classes:
        students_in_grade = Student.objects.filter(promotion__grade=grade)
        
        impregnation_count = Stage.objects.filter(
            student__in=students_in_grade, stage='impregnation'
        ).count()
        
        pedagogique_count = Stage.objects.filter(
            student__in=students_in_grade, stage='pedagogique'
        ).count()
        
        entreprise_count = Stage.objects.filter(
            student__in=students_in_grade, stage='entreprise'
        ).count()
        
        department_reports.append({
            "grade_classe": grade.libelle,
            "impregnation": impregnation_count,
            "pedagogique": pedagogique_count,
            "entreprise": entreprise_count
        })

    # 2. Étudiants Inscripts 
    departments_students = []
    
    departments = GradeClasse.objects.all()
    
    for department in departments:
        promotions = Promotion.objects.filter(grade=department)
        
        promotion_data = []
        for promotion in promotions:
            student_count = Student.objects.filter(promotion=promotion).count()
            promotion_data.append({
                "promotion": promotion.libelle,
                "student_count": student_count
            })
        
        departments_students.append( { "department": department.libelle, "section": department.grade.libelle,  "promotions": promotion_data} )

    departments_projets_memoires = []
    
    grade_classes = GradeClasse.objects.all()
    
    for grade in grade_classes:
        students_in_grade = Student.objects.filter(promotion__grade=grade)
        
        projets_tutores_count = ProjetTutore.objects.filter(
            Q(head__in=students_in_grade) | Q(member__in=students_in_grade)
        ).distinct().count()
        
        memoires_count = StudentMemoire.objects.filter(
            student__in=students_in_grade
        ).count()
        
        departments_projets_memoires.append({
            "grade_classe": grade.libelle,
            "section": grade.grade.libelle,
            "projets_tutores": projets_tutores_count,
            "memoires": memoires_count
        })

    directors_reports = {}
    
    directors = DirecteurTravaux.objects.all()
    user: User = request.user
    if user.has_perm('isp_stage.isp_departement_officier') :
        dept_officier = DeptRechercheOfficier.objects.filter(employee__user=user)
        if dept_officier.exists() :
            dept_officier = dept_officier.first()
            directors = directors.filter(department = dept_officier.dept)
        else :
            directors = DirecteurTravaux.objects.all()
    else :
        directors = DirecteurTravaux.objects.all()
    
    for director in directors:
        employee_id = director.employee.id
        
        if employee_id not in directors_reports:
            directors_reports[employee_id] = {
                "employee": director.employee.fullname,
                "grade_count": 0,
                "projets_tutores": 0,
                "memoires": 0
            }
        
        directors_reports[employee_id]["grade_count"] += GradeClasse.objects.filter(directeurtravaux=director).count()
        directors_reports[employee_id]["projets_tutores"] += ProjetTutore.objects.filter(director=director).count()
        directors_reports[employee_id]["memoires"] += StudentMemoire.objects.filter(director=director).count()
     
    return Response({
        "stages": {
            "count": len(stages),
            "impregnation" : len(stages.filter(stage="impregnation")),
            "pedagogique" : len(stages.filter(stage="pedagogique")),
            "departments": department_reports
        },
        "students": {
            "count": len(Student.objects.all()),
            "departements": departments_students
        },
        "projets_memoires": {
            "projets": len(ProjetTutore.objects.all()),
            "memoires": len(StudentMemoire.objects.all()),
            "departments": departments_projets_memoires
        },
        "directors": {
            "count": len(directors),
            "directors": list(directors_reports.values())
        }
    })