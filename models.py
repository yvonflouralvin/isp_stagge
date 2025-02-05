from django.db import models
from slugify import slugify
import uuid
from core.models import User
from uscitech_academy.models import Student, GradeClasse


class DeptRechercheOfficier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    dept = models.ForeignKey(GradeClasse, on_delete=models.CASCADE)


class StageMaster(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_quote_submitted = models.BooleanField(default=False)
    # dept = models.ForeignKey(GradeClasse, on_delete=models.CASCADE, null=True, blank=True)
    

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