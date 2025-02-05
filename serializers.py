from rest_framework import serializers 

from .models import *
from uscitech_academy.serializers import StudentSerializer, GradeClasseSerializer
from core.serializers import * 


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
    dept = GradeClasseSerializer()
    user = UserSerializer()

    class Meta: 
        model = DeptRechercheOfficier
        fields = ['id', 'user', 'dept']

