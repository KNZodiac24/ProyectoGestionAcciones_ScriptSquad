from rest_framework import routers
from django.urls import path
from .api import GestionAccionesViewSet

router = routers.DefaultRouter()

router.register('api/gestionAcciones', GestionAccionesViewSet, 'gestionAcciones')

urlpatterns = router.urls + [
    path('api/resumen-acciones/', resumen_acciones, name='resumen_acciones'),  # Ruta para los datos consolidados
]