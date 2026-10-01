from django.urls import path
from . import views

urlpatterns = [
    path('olamundo/', views.olamundo),
    path('', views.tasklist, name="task-list"),
    path('yourname/<str:name>', views.yourName, name = "your-name"),
]

