from rest_framework import serializers
from .models import GestionAcciones

class GestionAccionesSerializer(serializers.ModelSerializer):
    class Meta:
        model = GestionAcciones
        fields = ('id', 'fecha_compra', 'nombre_accion', 'cantidad', 'precio_unitario', 
                  'precio_total', 'porcentaje_ganancia', 'total_ganancia')
        read_only_fields = ('id', 'precio_total', 'porcentaje_ganancia', 'total_ganancia')

    def validate(self, data):
        # Calcula precio_total = cantidad * precio_unitario
        data['precio_total'] = data['cantidad'] * data['precio_unitario']
        # Redondea porcentaje_ganancia y total_ganancia solo si ya están en data
        if 'porcentaje_ganancia' in data:
            data['porcentaje_ganancia'] = round(data['porcentaje_ganancia'], 2)
        if 'total_ganancia' in data:
            data['total_ganancia'] = round(data['total_ganancia'], 2)
        return data