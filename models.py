from django.db import models
from slugify import slugify
import uuid
from core.models import User
from uscitech_academy.models import Student, GradeClasse, Teacher, AcademicYear, Promotion
from hr.models import Employee
from core.models import CoreBaseModel

class IspConfig(CoreBaseModel):
    id = models.UUIDField(default=uuid.uuid4, editable=False)
    config_key = models.CharField(primary_key=True, editable=True)
    config_value = models.CharField(max_length=255)

class UserSelectedAcademicYear(CoreBaseModel):
    id = models.CharField(primary_key=True, editable=True, max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, blank=True, null=True)

class DeptRechercheOfficier(CoreBaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, null=False)
    dept = models.ForeignKey(GradeClasse, on_delete=models.CASCADE)
    academicyear = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, null=True, blank=True)

class StageMaster(CoreBaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE)
    is_quote_submitted = models.BooleanField(default=False) 
    academicyear = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, null=True, blank=True)
    

class DirecteurTravaux(CoreBaseModel):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    direction_type = category = models.CharField(choices=[
        ('projet-tutore', 'Projet Tutoré'),
        ('memoire', 'Mémoire'),
        ('stage', 'Stage')
    ], null=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, null=False)
    department = models.ForeignKey(GradeClasse, on_delete=models.CASCADE, null=False)
    category = models.CharField(choices=[
        ('interne', 'Du Département'),
        ('externe', 'Pas du Département'),
    ], null=False)

    academicyear = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, null=True, blank=True)

    # Définir la contrainte d'unicité
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['department', 'direction_type', 'employee'], name='unique_director_for_dept_and_direction_type')
        ]


class Stage(CoreBaseModel):

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
    horraires = models.JSONField(null=True, blank=True, default=dict)
    facture = models.CharField(null=True, blank=True, max_length=30)
    horraire_status = models.BooleanField(default=False)
    quote = models.IntegerField(null=True, blank=True)
    quote_object = models.JSONField(default=dict)
    quote_by = models.ForeignKey(StageMaster, on_delete=models.CASCADE, null=True, blank=True, related_name="quote_by")
    quote_status = models.CharField(choices=[('submitted', "Soumie"), ('draft', "Brouillon")], default='draft')
    academicyear = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, null=True, blank=True)


class ProjetTutore(CoreBaseModel):

    STATUS_CHOICES = [
        ('in_progress', 'En cours'),
        ('submitted', 'Soumis'),
        ('validated', 'Validé'),
        ('rejected', 'Rejeté'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.TextField(null=False, blank=False)
    head = models.ForeignKey(Student, null=False, related_name="head", on_delete=models.CASCADE)
    member = models.ManyToManyField(Student, related_name="member" )
    director = models.ForeignKey(DirecteurTravaux, null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='in_progress',
        verbose_name="Statut"
    )
    academicyear = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, null=True, blank=True)


class ProjetTutoreSubmission(CoreBaseModel):
    projet = models.ForeignKey(ProjetTutore, on_delete=models.CASCADE, related_name="submissions")
    submitter = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True)
    submission_date = models.DateTimeField(auto_now_add=True)
    final_subject = models.CharField(max_length=255)
    members = models.ManyToManyField(Student, related_name="projet_submissions")

    def __str__(self):
        return f"Soumission pour {self.projet.subject} le {self.submission_date.strftime('%d/%m/%Y')}"
    academicyear = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, null=True, blank=True)



class StudentMemoire(CoreBaseModel):

    STATUS_CHOICES = [
        ('in_progress', 'En cours'),
        ('submitted', 'Soumis'),
        ('validated', 'Validé'),
        ('rejected', 'Rejeté'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.TextField(null=False, blank=False)
    student = models.ForeignKey(Student, null=False, related_name="student", on_delete=models.CASCADE) 
    director = models.ForeignKey(DirecteurTravaux, null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='in_progress',
        verbose_name="Statut"
    )
    academicyear = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, null=True, blank=True)

class StudentMemoireSubmission(CoreBaseModel):
    memoire = models.ForeignKey(StudentMemoire, on_delete=models.CASCADE, related_name="submissions")
    submitter = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True)
    submission_date = models.DateTimeField(auto_now_add=True)
    final_subject = models.CharField(max_length=255)
    academicyear = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"Soumission pour {self.memoire.subject} le {self.submission_date.strftime('%d/%m/%Y')}"


class DepartmentSettings(CoreBaseModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.ForeignKey(GradeClasse, on_delete=models.CASCADE, null=False)
    max_teacher_tutore_project_group = models.IntegerField(default=1, blank=True) # Nombre de groupe par directeur internet
    max_teacher_externe_tutore_project_group = models.IntegerField(default=1, blank=True) # Nombre de groupe par directeur externe
    max_teacher_memoire = models.IntegerField(default=1, blank=True) # Nombre de memoire du département
    max_teacher_externe_memoire = models.IntegerField(default=1, blank=True) # Nombre de memoire du département
    max_tutore_project_member_group = models.IntegerField(default=1, blank=True)
    academicyear = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, null=True, blank=True)

class IspStudent(models.Model):

    matricule = models.CharField(max_length=20, primary_key=True)

    nom = models.CharField(max_length=100)
    postnom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)

    codpromo = models.CharField(max_length=50)
    codsec = models.IntegerField()

    vacation = models.CharField(max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)

    academicyear = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name="isp_students",
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.matricule} - {self.nom} {self.postnom} {self.prenom}"
        

class IspPaiement(models.Model):

    student = models.ForeignKey(
        IspStudent,
        on_delete=models.CASCADE,
        related_name="paiements"
    )

    datepai = models.DateField()
    montant = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    academicyear = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name="isp_paiements",
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.student.matricule} - {self.montant} ({self.datepai})"

    class Meta:
        unique_together = ("student", "datepai", "montant", "academicyear")


class IspPaiementDepartement(models.Model):
    """
        Ce modele stoque les departements venant du systeme de l'ISP pour pouvoir le mapper et faire de filtre dans les listes
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) 
    libelle = models.CharField(max_length=250, null=True, blank=True)
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE, null=True, blank=True)
    academicyear = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.libelle} - {self.academicyear.libelle} - {self.promotion.libelle}"