# POC-0000 — Contexto

WALeads recibe mensajes de WhatsApp Cloud API, crea o reutiliza el lead por teléfono y registra el mensaje sin duplicados. Expone endpoints operativos para consultar leads y gestionar pedidos. Esta POC implementa el backend; la GUI queda fuera del incremento actual.

## Actores y alcance

- Cliente que escribe por WhatsApp.
- Meta WhatsApp Cloud API, que entrega webhooks firmados.
- Operador que consulta leads y administra pedidos mediante la API.
- MongoDB como persistencia real; repositorios en memoria para pruebas determinísticas.
