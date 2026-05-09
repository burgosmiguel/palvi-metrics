# palvi-metrics


### Decisiones técnicas

* Analizar la estructura del archivo metrics.json
* Crear Repo https://github.com/burgosmiguel/palvi-metrics
* Preparar entorno local de desarrollo
   * Docker 
   * React + TypeScript
* Preparar entorno cloud (GCP)
   * Cloud Run
   * Cloud Build
* URL https://palvi-metrics-817481579792.southamerica-west1.run.app


### Qué hace la app
> Dataset selector (Todos/A/B/C/D) — tab en el header, cambia toda la vista en tiempo real Alerta de foco — un único bloque prominente que dice qué atender hoy y por qué, basado en tendencias de los últimos 7 días vs la semana anterior. Cada dataset dispara algo distinto: A → "Pipeline empantanado" (stale deals +40%) B → "Métricas estables" C → "Win rate en alza" (deals ganados +62%) D → "Tiempo de respuesta crítico" (+23.7%) 5 KPIs con sparklines (30d): Win Rate, Tiempo de Respuesta, Deals Estancados, Leads/día, Tickets Soporte — todos con badge de tendencia dirección-aware 2 gráficos de tendencia (30d): Tiempo de Respuesta (línea) y Deals Estancados (área) Embudo de conversión (30d) con escala logarítmica para que todos los escalones sean legibles, y tasas de conversión coloreadas por salud (verde/ámbar/rojo) 
>
### Decisiones clave

 >El algoritmo de foco prioriza respuesta lenta (×3) > deals estancados (×2.5) > win rate > leads > soporte — porque en B2B la respuesta lenta es el problema más silencioso y más caro Ventana de 7 días para comparar (no día individual, que es muy ruidoso) Win rate calculado como suma total del período, no promedio de tasas diarias

### Segunda iteración

* Mejora de los graficos
* Obtener datos de distintas fuentes
* Crear API para que datos sean consultados desde otros puntos
* Exportar graficos

### Instrucciones para correrlo localmente
```
git clone https://github.com/burgosmiguel/palvi-metrics.git
npm install
npm run dev
http://localhost:5173/
```
