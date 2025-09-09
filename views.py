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

from rest_framework import status 

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
 

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_projet_tutore(request, projet_id):
    """
    Vue pour soumettre un projet tutoré final.
    """
    try:
        projet = ProjetTutore.objects.get(pk=projet_id)
    except ProjetTutore.DoesNotExist:
        return Response({"error": "Projet non trouvé."}, status=status.HTTP_404_NOT_FOUND)

    # Vérifier si l'utilisateur est un étudiant et membre du projet
    # student = getattr(request.user, 'student', None)

    student = get_object_or_404(Student, user__id = request.user.id)
    if not student or not projet.member.filter(pk=student.pk).exists():
        return Response(
            {"error": "Vous n'êtes pas autorisé à soumettre ce projet."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = ProjetTutoreSubmissionSerializer(data=request.data)
    if serializer.is_valid():
        validated_data = serializer.validated_data
        
        # Créer l'enregistrement de la soumission
        submission = ProjetTutoreSubmission.objects.create(
            projet=projet,
            submitter=student,
            final_subject=validated_data['subject']
        )
        
        # Ajouter les membres à la soumission
        member_ids = validated_data['members']
        members = Student.objects.filter(id__in=member_ids)
        submission.members.set(members)
        
        # Mettre à jour le statut du projet
        projet.status = 'submitted'
        projet.subject = validated_data['subject'] # Met aussi à jour le sujet principal
        projet.member.set(members) # <-- AJOUT DE CETTE LIGNE
        projet.save()
        
        return Response(
            {"success": "Projet soumis avec succès."},
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def projet_tutore_submission_details(request, projet_id):
    """
    Vue pour annuler la soumission d'un projet tutoré.
    """
    # # Vérifier si l'utilisateur a la permission (ex: officier du département)
    # if not request.user.has_perm('isp_stage.isp_departement_officier'):
    #     return Response(
    #         {"error": "Vous n'avez pas la permission d'annuler cette soumission."},
    #         status=status.HTTP_403_FORBIDDEN
    #     )

    try:
        projet = ProjetTutore.objects.get(pk=projet_id)
    except ProjetTutore.DoesNotExist:
        return Response({"error": "Projet non trouvé."}, status=status.HTTP_404_NOT_FOUND)

    # Trouver et supprimer la soumission associée
    submission = ProjetTutoreSubmission.objects.filter(projet=projet)
    # if submission.exists():
    #     submission.delete()

    # # Mettre à jour le statut du projet
    # projet.status = 'in_progress'
    # projet.save()

    return Response(
        ProjetTutoreSubmissionDetailSerializer(submission.first()).data,
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_projet_tutore_submission(request, projet_id):
    """
    Vue pour annuler la soumission d'un projet tutoré.
    """
    # Vérifier si l'utilisateur a la permission (ex: officier du département)
    if not request.user.has_perm('isp_stage.isp_departement_officier'):
        return Response(
            {"error": "Vous n'avez pas la permission d'annuler cette soumission."},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        projet = ProjetTutore.objects.get(pk=projet_id)
    except ProjetTutore.DoesNotExist:
        return Response({"error": "Projet non trouvé."}, status=status.HTTP_404_NOT_FOUND)

    # Trouver et supprimer la soumission associée
    submission = ProjetTutoreSubmission.objects.filter(projet=projet)
    if submission.exists():
        submission.delete()

    # Mettre à jour le statut du projet
    projet.status = 'in_progress'
    projet.save()

    return Response(
        {"success": "La soumission du projet a été annulée avec succès."},
        status=status.HTTP_200_OK
    )