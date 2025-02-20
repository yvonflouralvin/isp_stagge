from django.db import models
from slugify import slugify
import uuid
from core.models import User
from uscitech_academy.models import Student, GradeClasse, Teacher
from hr.models import Employee


class DeptRechercheOfficier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, null=False)
    dept = models.ForeignKey(GradeClasse, on_delete=models.CASCADE)


class StageMaster(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE)
    is_quote_submitted = models.BooleanField(default=False) 
    

class Stage(models.Model):

    STAGE_TYPES = [
        ('impregnation', "Imprégnation"),
        ('pedagogique', 'Pédagogique'),
        ('entreprise', 'Entreprise')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    stage = models.CharField(choices=STAGE_TYPES)
    stagemaster = models.ManyToManyField(StageMaster)
    start_date = models.CharField(max_length=20, null=True, blank=True)
    end_date = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    institution =  models.TextField(null=True, blank=True)
    institution_address =  models.TextField(null=True, blank=True)
    institution_provisor =  models.TextField(null=True, blank=True)
    institution_provisor_provisor =  models.TextField(null=True, blank=True)
    horraires = models.JSONField(null=True, blank=True, default={})
    facture = models.CharField(null=True, blank=True, max_length=30)
    horraire_status = models.BooleanField(default=False)
    quote = models.IntegerField(null=True, blank=True)
    quote_by = models.ForeignKey(StageMaster, on_delete=models.CASCADE, null=True, blank=True, related_name="quote_by")
    quote_status = models.CharField(choices=[('submitted', "Soumie"), ('draft', "Brouillon")], default='draft')


class ProjetTutore(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.TextField(null=False, blank=False)
    head = models.ForeignKey(Student, null=False, related_name="head", on_delete=models.CASCADE)
    member = models.ManyToManyField(Student, related_name="member" )
    teacher = models.ForeignKey(Teacher, null=True, blank=True, on_delete=models.SET_NULL)


class StudentMemoire(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.TextField(null=False, blank=False)
    student = models.ForeignKey(Student, null=False, related_name="student", on_delete=models.CASCADE) 
    teacher = models.ForeignKey(Teacher, null=True, blank=True, on_delete=models.SET_NULL)

class DepartmentSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.ForeignKey(GradeClasse, on_delete=models.CASCADE, null=False)
    max_teacher_tutore_project_group = models.IntegerField(default=1, blank=True)
    max_teacher_memoire = models.IntegerField(default=1, blank=True)
    max_tutore_project_member_group = models.IntegerField(default=1, blank=True)