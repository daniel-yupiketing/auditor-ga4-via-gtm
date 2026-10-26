# Auditor de dataLayer y analizador de GA4 (vía GTM)

Extensión de Google Chrome (Manifest V3) para capturar en tiempo real los envíos al `dataLayer`, auditar eventos de **Google Analytics 4 (GA4)** frente a las etiquetas y variables configuradas en un contenedor de **Google Tag Manager (GTM)** y exportar informes detallados.

---

## ✨ Características principales

- **Captura en vivo del `dataLayer`**: intercepta `dataLayer.push` y el estado inicial del `dataLayer` en cualquier página web.
- **Analizador de eventos de GA4 frente a GTM**:
  - Valida automáticamente si cada evento capturado o importado cumple con los parámetros exigidos por su etiqueta de GA4 (`gaawe`) en GTM (`eventModel.*` y estructura de `items`).
  - Soporta la carga de cualquier archivo `.json` exportado de Google Tag Manager para actualizar las reglas dinámicamente.
  - Diferencia entre parámetros obligatorios y opcionales en eventos personalizados, exigiendo todos los parámetros configurados en los eventos recomendados por Google.
- **Deduplicación inteligente de errores**: agrupa errores idénticos para evitar duplicados al navegar varias veces por una misma página, registrando todas las URL donde se ha detectado cada incidencia.
- **Filtros persistentes**: recuerda automáticamente tus filtros seleccionados (`Solo eventos GTM`, `Solo con event`, `Solo PII`, `Solo errores GA4`, pestaña activa y modo de deduplicación).
- **Detección de PII**: alerta visualmente si algún evento contiene datos personales (teléfonos, correos electrónicos o DNI/NIE).
- **Exportación de informes**:
  - **📄 Informe visual (HTML)**: informe interactivo con filtros, resumen ejecutivo y vista lista para imprimir o guardar en PDF.
  - **📊 CSV**: tabla estructurada compatible con Excel y Google Sheets.
  - **📥 JSON**: exportación completa del análisis y de los payloads.

---

## 🚀 Instalación en Google Chrome / Edge / Brave

1. Descarga este repositorio (puedes pulsar en **Code → Download ZIP** y descomprimirlo en tu ordenador, o clonarlo con `git clone https://github.com/daniel-yupiketing/auditor-ga4-via-gtm.git`).
2. Abre Google Chrome y navega a `chrome://extensions/`.
3. Activa el interruptor **«Modo de desarrollador»** en la esquina superior derecha.
4. Pulsa el botón **«Cargar descomprimida»** (arriba a la izquierda).
5. Selecciona la carpeta donde hayas descargado o descomprimido este repositorio.

---

## 🛠️ Uso rápido

1. **Capturar eventos en vivo**: navega por el sitio web que quieras auditar con la grabación activa (`⏺ Grabando`).
2. **Auditar un archivo JSON de eventos**: pulsa **«📂 Subir JSON de eventos»** (o abre la vista completa con el botón **«↗ Pestaña»** para trabajar a pantalla completa).
3. **Cambiar el contenedor de GTM**: en la pestaña **«🔍 Analizador de GA4 (GTM)»**, pulsa **«⚙️ Cambiar GTM (.json)»** y selecciona cualquier exportación JSON de Google Tag Manager.
4. **Descargar el informe**: pulsa **«📄 Informe visual (HTML)»**, **«📊 CSV»** o **«📥 JSON»** para compartir los resultados.
