from django.shortcuts import render , get_object_or_404
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import JsonResponse 
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from uscitech_academy.models import *

from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import * 
from .serializers import *
from uscitech_academy.models import Student

from rest_framework import status 

import json

import requests
from datetime import date

def get_current_academic_year(user):
    user_current_academic_year = UserSelectedAcademicYear.objects.filter(user = user).first()
    if user_current_academic_year :
        return user_current_academic_year.academic_year.id
    else :
        default_academic_year = UserSelectedAcademicYear.objects.filter(id="default_academic_year").first() 
        if default_academic_year :
            UserSelectedAcademicYear.objects.create(
                id = f'{user.id}',
                user = user,
                academic_year = default_academic_year.academic_year
            )
            return default_academic_year.academic_year.id
    return None

def get_academic_year(user):
    return AcademicYear.objects.filter(id=get_current_academic_year(user)).first()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stages_resumes(request):

    user: User = request.user
    if user == None :
        return Response({
            "students": 0,
            "impregnations": 0 ,
            "pedagogiques": 0,
            "affected": 0,
            "error":"No user exist"
        })

    academic_year = get_academic_year(user)

    stages = Stage.objects.filter(
        academicyear=academic_year
    ).exclude(student = None).exclude(student__user = None)
    students = Student.objects.filter(
        academicyear=academic_year
    ).exclude(user = None)

    # print(user.pemissions)
    if user.is_superuser : 
        stages = Stage.objects.filter(
            academicyear=academic_year
        ).exclude(student = None).exclude(student__user = None)
    elif not user.is_superuser and user.has_perm('isp_stage.isp_departement_officier'):
        dept_off = DeptRechercheOfficier.objects.filter(employee__user__id=user.id)
        if dept_off.exists() :
            stages = Stage.objects.filter(
                academicyear=academic_year,
                student__promotion__grade__id=dept_off[0].dept.id
            )
            students = students.filter(promotion__grade__id=dept_off[0].dept.id)
    elif not user.is_superuser and not user.has_perm('isp_stage.isp_departement_officier') and user.has_perm('isp_stage.isp_user_stage_master'):
        stages = Stage.objects.filter(
            academicyear=academic_year,
            stagemaster__employee__user__id = user.id
        )
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

    user: User = request.user 
    academic_year = get_academic_year(user)

    # 1. Rapport sur les Stages
    stages = Stage.objects.filter(
        academicyear=academic_year
    )

    department_reports = []
    
    grade_classes = GradeClasse.objects.all()
    
    for grade in grade_classes:
        students_in_grade = Student.objects.filter(promotion__grade=grade, academicyear=academic_year)
        
        impregnation_count = Stage.objects.filter(
            student__in=students_in_grade, stage='impregnation', academicyear=academic_year
        ).count()
        
        pedagogique_count = Stage.objects.filter(
            student__in=students_in_grade, stage='pedagogique', academicyear=academic_year
        ).count()
        
        entreprise_count = Stage.objects.filter(
            student__in=students_in_grade, stage='entreprise', academicyear=academic_year
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
            student_count = Student.objects.filter(promotion=promotion, academicyear=academic_year).count()
            promotion_data.append({
                "promotion": promotion.libelle,
                "student_count": student_count
            })
        
        departments_students.append( { "department": department.libelle, "section": department.grade.libelle,  "promotions": promotion_data} )

    departments_projets_memoires = []
    
    grade_classes = GradeClasse.objects.all()
    
    for grade in grade_classes:
        students_in_grade = Student.objects.filter(promotion__grade=grade, academicyear=academic_year)
        
        projets_tutores_count = ProjetTutore.objects.filter(
            Q(head__in=students_in_grade) | Q(member__in=students_in_grade)
        ).distinct().count()
        
        memoires_count = StudentMemoire.objects.filter(
            student__in=students_in_grade, academicyear=academic_year
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
                "employee_id": director.employee.id,
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



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_resumes_for_director(request, employee):
    user: User = request.user
    academic_year = get_academic_year(user)
    dept_officier = None
    director = None
    if user.has_perm('isp_stage.isp_departement_officier') :
        dept_officier = DeptRechercheOfficier.objects.filter(employee__user=user)
        if dept_officier.exists() :
            dept_officier = dept_officier.first()
            directors = DirecteurTravaux.objects.filter(department = dept_officier.dept, employee__id = employee)
            if directors.exists():
                reports = {
                    "director": EmployeeSerializer(directors.first().employee).data,
                    "department": GradeClasseSerializer(directors.first().department).data,
                    "memoires": [],
                    "projects": []
                }
                for director in directors :
                    if director.direction_type == "memoire" : 
                        reports['memoires'] = StudentMemoireSerializer(StudentMemoire.objects.filter(director=director), many=True).data
                    elif director.direction_type == "projet-tutore" : 
                        reports['projects'] = ProjetTutoreSerializer(ProjetTutore.objects.filter(director=director), many=True).data
                return Response(reports, 200)
            return Response("No director informations found for this employee", 404)
        return Response("You are not Department chief", 404)
    return Response("You don't have right of  Department chief", 404)


@api_view(["POST"])
@permission_classes([AllowAny])
def sync_isp_paiements(request):

    """
    Synchronisation des paiements depuis l'API externe.
    Si "date" est envoyé en POST, utilise cette date, sinon la date du jour.
    """

    # récupère la date envoyée, sinon date du jour
    datepai = request.data.get("date")
    if not datepai:
        datepai = date.today().strftime("%Y-%m-%d")

    url = f"https://progestion-app.net/app/codes/api/v1/apistage.php?datepai='{datepai}'"

    try:
        response = requests.get(url, timeout=30)
        data = json.loads(response.content.decode("utf-8-sig"))
    except Exception as e:
        print(e)
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)

    print(data)

    if data.get("status") != "success":
        return Response({
            "status": "error",
            "message": "API error"
        }, status=400)

    saved = 0

    for item in data.get("data", []):

        student, created = IspStudent.objects.get_or_create(
            matricule=item["matricule"],
            defaults={
                "nom": item["nom"],
                "postnom": item["postnom"],
                "prenom": item["prenom"],
                "codpromo": item["codpromo"],
                "codsec": item["codsec"],
                "vacation": item["vacation"],
            }
        )

        IspPaiement.objects.get_or_create(
            student=student,
            datepai=item["datepai"],
            montant=item["montant"]
        )
        
        IspPaiementDepartement.objects.get_or_create(
            libelle=item["codpromo"]
        )

        saved += 1

    return Response({
        "status": "success",
        "date": datepai,
        "records_saved": saved
    })