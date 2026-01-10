# PokeTrend AI 📈

Una herramienta impulsada por Inteligencia Artificial para encontrar "outliers" (anomalías de mercado), tendencias virales e ideas de contenido para el nicho de Pokémon Investing y Collecting.

## 🚀 Instalación y Ejecución

Sigue estos pasos para ejecutar el proyecto en tu ordenador:

### 1. Requisitos Previos
Necesitas tener instalado **Node.js** (versión 18 o superior).

### 2. Instalar Dependencias
Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

### 3. Configurar la API Key
1. Renombra el archivo `.env.example` a `.env`.
2. Abre el archivo `.env` con un editor de texto.
3. Pega tu API Key de Google Gemini (ver guía `GUIA_IA.md`).

### 4. Ejecutar la Aplicación
Ejecuta el siguiente comando:

```bash
npm run dev
```

Abre tu navegador en la dirección que aparece (normalmente `http://localhost:5173`).

## 🛠️ Tecnologías

- **React + Vite**: Framework frontend rápido.
- **Google Gemini API**: Motor de inteligencia artificial (Modelo: gemini-3-flash-preview).
- **Tailwind CSS**: Estilizado moderno y responsivo.
- **Recharts**: Gráficos de análisis de datos.

## 📁 Estructura del Proyecto

- `/src`: Contiene todo el código fuente.
- `/src/services`: Lógica de conexión con la IA.
- `/src/components`: Componentes visuales (Tarjetas, Gráficos, Tablero).
- `/src/types.ts`: Definiciones de tipos de TypeScript.
