from rest_framework import serializers 

from .models import *
from uscitech_academy.serializers import StudentSerializer, GradeClasseSerializer, TeacherSerializer
from uscitech_academy.models import Teacher
from core.serializers import * 
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import  Permission


class StageMasterSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta: 
        model =  StageMaster
        fields = ['id','user', 'is_quote_submitted']
        # fields = ['id','dept', 'user']

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
    user = UserSerializer(read_only=True)
    fullname = serializers.CharField(required=True, write_only=True)
    email = serializers.CharField(required=True, write_only=True)
    phone = serializers.CharField(required=False, write_only=True)


    class Meta: 
        model = DeptRechercheOfficier
        fields = ['id', 'user', 'dept', 'fullname', 'email', 'phone', 'dept_id']

    def create(self, validated_data):
        fullname = validated_data.pop("fullname", None) 
        email = validated_data.pop("email", None)
        phone = validated_data.pop("phone", None)

        fullname_splited = str(fullname).split(" ")
        # Création d'un utilisateur s'il n'est pas fourni
        user = User.objects.create( 
            name = fullname_splited[0] ,
            last_name = fullname_splited[1] if len(fullname_splited) >=2 else fullname_splited[0],
            first_name = fullname_splited[2] if len(fullname_splited) >=3 else fullname_splited[0],
            username = email,
            phone = phone if phone != "" else None,
            email = email,
            password = make_password("DefaultPass123")
        )

        user.user_permissions.add(Permission.objects.get(codename="isp_departement_officier"))
        user.save()

        # Création de l'employé avec l'utilisateur nouvellement créé
        validated_data["user"] = user 
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Mise à jour de l'utilisateur associé 

        fullname = validated_data.pop("fullname", None) 
        email = validated_data.pop("email", None)
        phone = validated_data.pop("phone", None)

        user = instance.user

        if fullname :
            fullname_splited = str(fullname).split(" ")
            user.name = fullname_splited[0]
            user.last_name = fullname_splited[1] if len(fullname_splited) >=2 else fullname_splited[0]
            user.first_name = fullname_splited[2] if len(fullname_splited) >=3 else fullname_splited[0]

        if email :
            user.username = email
            user.email = email
        
        if phone :
            user.phone = phone if phone != "" else None

        user.save()

        validated_data["user"] = user 

        return super().update(instance, validated_data)

    

class ProjetTutoreSerializer(serializers.ModelSerializer):
    head = StudentSerializer(read_only=True)
    teacher = TeacherSerializer(read_only=True)
    head_id = serializers.PrimaryKeyRelatedField(
        queryset = Student.objects.all(), source="head", required=True, allow_null=False
    )
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset = Teacher.objects.all(), source="teacher", required=False, allow_null=False
    )
    class Meta :
        model = ProjetTutore
        fields = ['id', 'subject', 'head_id', 'head', 'member', 'teacher', 'teacher_id']
    


class StudentMemoireSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    teacher = TeacherSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset = Student.objects.all(), source="student", required=True, allow_null=False
    )
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset = Teacher.objects.all(), source="teacher", required=False, allow_null=False
    )
    class Meta :
        model = StudentMemoire
        fields = ['id', 'subject', 'student_id', 'student', 'teacher', 'teacher_id']
    

class DepartmentSettingsSerializer(serializers.ModelSerializer):
    department = GradeClasseSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset = GradeClasse.objects.all(), source="department", required=True, allow_null=False
    )
    max_teacher_tutore_project_group = serializers.IntegerField(required = False)
    max_teacher_memoire = serializers.IntegerField(required = False)
    max_tutore_project_member_group = serializers.IntegerField(required = False)
    class Meta :
        model = DepartmentSettings
        fields = ['id', 'department', 'department_id', 'max_teacher_tutore_project_group', 'max_teacher_memoire', 'max_tutore_project_member_group']
