from django.db import models
from django.core.validators import MinValueValidator

# Create your models here.
class GestionAcciones(models.Model):
    fecha_compra = models.DateField()                   # fecha de compra
    nombre_accion = models.CharField(max_length=100)    # nombre de las acciones
    cantidad = models.IntegerField(validators=[MinValueValidator(1)])   # cantidad de acciones compradas
    precio_unitario = models.FloatField(validators=[MinValueValidator(0)], default=0.0) # precio de cada accion
    precio_total = models.FloatField()                  # precio total de la compra                 
    porcentaje_ganancia = models.FloatField(default=0.0)           # porcentaje de ganancia
    total_ganancia = models.FloatField(default=0.0)                # ganancia en dinero