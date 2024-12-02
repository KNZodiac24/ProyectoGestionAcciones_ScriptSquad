from rest_framework import viewsets, permissions
from .models import GestionAcciones
from django.shortcuts import render
from .serializers import GestionAccionesSerializer
import requests
from dotenv import load_dotenv
import os

class GestionAccionesViewSet(viewsets.ModelViewSet):
    queryset = GestionAcciones.objects.all()
    serializer_class = GestionAccionesSerializer
    permission_classes = [permissions.AllowAny]

    load_dotenv()
    PROFIT_API_TOKEN = os.environ.get('PROFIT_API_TOKEN')
    PROFIT_API_URL = os.environ.get('PROFIT_API_URL')

    # Define la URL base y el token de autenticación para la API de Profit
    # PROFIT_API_TOKEN = "b32d8b7cd94a4ab2bda2475f652a4fcd" # !Comment
    # PROFIT_API_URL = "https://api.profit.com/data-api/market-data/quote"
    # PROFIT_API_URL = f"https://api.profit.com/data-api/market-data/quote/TSLA?token={PROFIT_API_TOKEN}"

    def obtener_precio_actual(self, nombre_accion):
        """Obtiene el precio actual de la acción desde la API de Profit."""
        url = f"{self.PROFIT_API_URL}/{nombre_accion}?token={self.PROFIT_API_TOKEN}"
        try:
            response = requests.get(url)
            response.raise_for_status()  # Lanza una excepción si hay un error en la solicitud
            
            data = response.json()
            print("Respuesta de la API:",data)

            return data.get("price")  # Extrae el precio actual de la respuesta de Profit
        except requests.exceptions.RequestException as e:
            print("Ha ocurrido un error en la solicitud:", e)
            return None

    def perform_create(self, serializer):
        # Guardado temporal sin calcular `porcentaje_ganancia` y `total_ganancia`
        instance = serializer.save()
        nombre_accion = instance.nombre_accion

        # Obtener el precio actual de la acción
        precio_actual = self.obtener_precio_actual(nombre_accion)
        #print("Precio actual de la acción:", precio_actual)

        if precio_actual is not None and instance.precio_unitario > 0:
            # Calcula el porcentaje y total de ganancia
            total_ganancia = (precio_actual * instance.cantidad) - instance.precio_total
            porcentaje_ganancia = (total_ganancia / instance.precio_total) * 100

            # Redondea los valores a dos decimales
            total_ganancia = round(total_ganancia, 2)
            porcentaje_ganancia = round(porcentaje_ganancia, 2)
        else:
            porcentaje_ganancia = 0.0
            total_ganancia = 0.0

        # Actualizar `porcentaje_ganancia` y `total_ganancia`
        instance.porcentaje_ganancia = porcentaje_ganancia
        instance.total_ganancia = total_ganancia
        instance.save()

    # def perform_create(self, serializer):
    #     # Guarda el objeto temporalmente sin calcular `porcentaje_ganancia` y `total_ganancia`
    #     instance = serializer.save()

    #     # Obtener el precio actual de la acción usando `yfinance`
    #     ticker = yf.Ticker(instance.nombre_accion)
    #     precio_actual = ticker.history(period="1d")['Close'][0]  # Último precio de cierre

    #     # Calcular porcentaje de ganancia
    #     if instance.precio_unitario > 0:
    #         porcentaje_ganancia = ((precio_actual - instance.precio_unitario) / instance.precio_unitario) * 100
    #         total_ganancia = (porcentaje_ganancia / 100) * instance.precio_total
    #     else:
    #         porcentaje_ganancia = 0
    #         total_ganancia = 0

    #     # Actualizar `porcentaje_ganancia` y `total_ganancia`
    #     instance.porcentaje_ganancia = porcentaje_ganancia
    #     instance.total_ganancia = total_ganancia
    #     instance.save()