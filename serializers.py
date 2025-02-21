from rest_framework import serializers 



from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import  Permission
import os

from core.serializers import UserSerializer
from hr.serializers import EmployeeSerializer
from uscitech_academy.serializers import *

from .models import *
from uscitech_academy.models import Teacher
from hr.models import *

class StageMasterSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset = Employee.objects.all(), source="employee", required=True, allow_null=False
    )

    class Meta: 
        model =  StageMaster
        fields = ['id','employee_id', 'employee', 'is_quote_submitted'] 

    def validate_employee_id(self, value):
        """Vérifie qu'un DeptRechercheOfficier n'existe pas déjà pour cet employee"""
        if StageMaster.objects.filter(employee=value).exists():
            raise serializers.ValidationError("Cet employé est déjà enregistré en tant que maitre de stage")
        if DeptRechercheOfficier.objects.filter(employee=value).exists():
            raise serializers.ValidationError("Cet employé est déjà enregistré en tant que responsable de recherche au département")
        return value

    def create(self, validated_data):
        """Crée l'objet et attribue la permission `isp_departement_officier` à l'utilisateur associé"""
        stage_master = StageMaster.objects.create(**validated_data)

        # Récupérer l'utilisateur lié à l'employé
        user = stage_master.employee.user  # Assumant que Employee a une relation OneToOne avec User

        # Vérifier si la permission existe
        try:
            permission = Permission.objects.get(codename="isp_user_stage_master")
        except Permission.DoesNotExist:
            raise serializers.ValidationError("La permission 'isp_user_stage_master' n'existe pas.")

        # Assigner la permission à l'utilisateur
        user.user_permissions.add(permission)

        return stage_master

class StageSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    stagemaster = StageMasterSerializer(many=True)
    quote_by = StageMasterSerializer()
    
    class Meta :
        model = Stage
        fields = ['id', 'stage', 'student', 'stagemaster', 'start_date', 'end_date', 'institution', 'institution_address', 'facture', 'horraires' , 'horraire_status', 'quote', 'quote_by', 'quote_status' ]

class DeptRechercheOfficierSerializer(serializers.ModelSerializer):
    dept = GradeClasseSerializer(read_only=True)
    dept_id = serializers.PrimaryKeyRelatedField(
        queryset = GradeClasse.objects.all(), source="dept", required=True, allow_null=False
    )
    employee = EmployeeSerializer(read_only=True)
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset = Employee.objects.all(), source="employee", required=True, allow_null=False
    )

    class Meta: 
        model = DeptRechercheOfficier
        fields = ['id', 'employee', 'employee_id', 'dept_id', 'dept']

    def validate_employee_id(self, value):
        """Vérifie qu'un DeptRechercheOfficier n'existe pas déjà pour cet employee"""
        if DeptRechercheOfficier.objects.filter(employee=value).exists():
            raise serializers.ValidationError("Cet employé a déjà un département assigné.")
        if StageMaster.objects.filter(employee=value).exists():
            raise serializers.ValidationError("Cet employé est déjà enregistré en tant que maitre de stage")
        return value

    def create(self, validated_data):
        """Crée l'objet et attribue la permission `isp_departement_officier` à l'utilisateur associé"""
        dept_officier = DeptRechercheOfficier.objects.create(**validated_data)

        # Récupérer l'utilisateur lié à l'employé
        user = dept_officier.employee.user  # Assumant que Employee a une relation OneToOne avec User

        # Vérifier si la permission existe
        try:
            permission = Permission.objects.get(codename="isp_departement_officier")
        except Permission.DoesNotExist:
            raise serializers.ValidationError("La permission 'isp_departement_officier' n'existe pas.")

        # Assigner la permission à l'utilisateur
        user.user_permissions.add(permission)

        return dept_officier

class DirecteurTravauxSerializer(serializers.ModelSerializer):

    employee = EmployeeSerializer(read_only = True)
    employee_id =  serializers.PrimaryKeyRelatedField(
        queryset = Employee.objects.all(), source="employee", required=True, allow_null=False
    )
    department = GradeClasseSerializer(read_only=True)
    department_id =  serializers.PrimaryKeyRelatedField(
        queryset = GradeClasse.objects.all(), source="department", required=True, allow_null=False
    )

    class Meta :
        model = DirecteurTravaux
        fields = [
            'id', 'direction_type', 'category', 'employee', 'employee_id', 'department', 'department_id'
        ]

class ProjetTutoreSerializer(serializers.ModelSerializer):
    head = StudentSerializer(read_only=True)
    director = DirecteurTravauxSerializer(read_only=True)
    head_id = serializers.PrimaryKeyRelatedField(
        queryset = Student.objects.all(), source="head", required=True, allow_null=False
    )
    director_id = serializers.PrimaryKeyRelatedField(
        queryset = DirecteurTravaux.objects.all(), source="director", required=False, allow_null=False
    )
    class Meta :
        model = ProjetTutore
        fields = ['id', 'subject', 'head_id', 'head', 'member', 'director', 'director_id']
    


class StudentMemoireSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    director = DirecteurTravauxSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset = Student.objects.all(), source="student", required=True, allow_null=False
    )
    director_id = serializers.PrimaryKeyRelatedField(
        queryset = DirecteurTravaux.objects.all(), source="director", required=False, allow_null=False
    )
    class Meta :
        model = StudentMemoire
        fields = ['id', 'subject', 'student_id', 'student', 'director', 'director_id']
    

class DepartmentSettingsSerializer(serializers.ModelSerializer):
    department = GradeClasseSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset = GradeClasse.objects.all(), source="department", required=True, allow_null=False
    )
    max_teacher_tutore_project_group = serializers.IntegerField(required = False) #max_teacher__externe_memoire
    max_teacher_externe_tutore_project_group = serializers.IntegerField(required = False) #max_teacher__externe_memoire
    max_teacher_externe_memoire = serializers.IntegerField(required = False) #max_teacher__externe_memoire
    max_teacher_memoire = serializers.IntegerField(required = False)
    max_tutore_project_member_group = serializers.IntegerField(required = False)
    class Meta :
        model = DepartmentSettings
        fields = ['id', 'department', 'department_id', 'max_teacher_tutore_project_group', 'max_teacher_memoire', 'max_tutore_project_member_group', 'max_teacher_externe_tutore_project_group', 'max_teacher_externe_memoire']


