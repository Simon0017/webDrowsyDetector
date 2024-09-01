from django.shortcuts import render,redirect,get_object_or_404
from django.http import HttpResponse,FileResponse,Http404
from bson import json_util,ObjectId
from mongoengine import *
from django.contrib.sessions.models import Session
from django.contrib.sessions.backends.db import SessionStore
from django.urls import reverse

# Create your views here.
# view for the index file
def index(request):
    return render(request,'index.html')