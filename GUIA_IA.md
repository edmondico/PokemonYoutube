# Guía de Configuración y Uso de la IA (Gemini) 🤖

Este proyecto utiliza el modelo más reciente de Google, **Gemini 2.0 Flash / 3.0 Preview**, para analizar tendencias de búsqueda en tiempo real.

## 🔑 1. Cómo conseguir tu API Key (Gratis)

Para que la aplicación funcione, necesitas una llave de acceso (API Key) de Google.

1.  Ve a **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2.  Inicia sesión con tu cuenta de Google.
3.  Haz clic en el botón azul **"Create API Key"**.
4.  Si te pide seleccionar un proyecto, puedes crear uno nuevo ("Create API key in new project").
5.  Copia la cadena de caracteres que empieza por `AIza...`.
6.  Pégala en tu archivo `.env` local: `API_KEY=AIzaSyB...`

> **Nota:** La capa gratuita de Gemini es muy generosa y suficiente para uso personal.

## 🧠 2. Cómo funciona la IA en esta App

La aplicación no "inventa" datos aleatorios. Utiliza una técnica llamada **Grounding (Google Search)**.

*   **Paso 1:** Cuando pulsas "Scan", la app envía un prompt complejo a Gemini.
*   **Paso 2:** Gemini utiliza la herramienta interna de Google Search para buscar en tiempo real qué está pasando en el mundo de Pokémon (eBay, foros, YouTube, noticias).
*   **Paso 3:** La IA procesa esa información y la categoriza en 4 listas:
    *   **Outliers:** Anomalías estadísticas (ej. una carta que subió 300% ayer).
    *   **General Ideas:** Contenido evergreen (siempre funciona).
    *   **Trending:** Noticias de última hora.
    *   **Most Searched:** Lo que la gente escribe en Google (SEO).

## ⚙️ 3. Funcionalidades Avanzadas

### Entrenar a la IA (Botón Dislike 👎)
Cada vez que haces clic en el botón de "Dislike" (pulgar abajo) en una tarjeta:
1.  Esa idea se elimina de tu vista.
2.  El título de esa idea se guarda en una "lista negra" temporal.
3.  En tu **siguiente búsqueda**, esa lista se envía a la IA con la instrucción: *"El usuario odia estos temas, no me des nada parecido"*.
4.  Esto hace que la IA aprenda de tus gustos durante la sesión.

### Instrucciones Personalizadas (Custom Instructions)
Debajo de los botones de escaneo hay un checkbox **"Add Custom Instructions"**.

*   Úsalo para refinar la búsqueda.
*   **Ejemplos:**
    *   *"Céntrate solo en cartas vintage anteriores a 2005".*
    *   *"Busca oportunidades de inversión de bajo presupuesto (menos de $50)".*
    *   *"Ignora todo lo relacionado con el set 151".*

### Generación de Guiones
Cuando haces clic en el icono del documento en una tarjeta:
1.  Se envía el título y la descripción a Gemini.
2.  Gemini genera un guion estructurado con: Hook (Gancho), Intro, Puntos Clave y Conclusión.
