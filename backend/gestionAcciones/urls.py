from rest_framework import routers
from .api import GestionAccionesViewSet

router = routers.DefaultRouter()

router.register('api/gestionAcciones', GestionAccionesViewSet, 'gestionAcciones')

urlpatterns = router.urls