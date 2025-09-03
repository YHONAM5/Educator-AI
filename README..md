MentorFlexAI/
├─ data/
│  ├─ raw/            # PDFs, diapositivas, apuntes
│  ├─ labeled/        # CSV/JSONL con respuestas y nivel
├─ models/
│  ├─ level_clf.joblib
│  └─ embedder/       # cache de sentence-transformers
├─ vectorstore/
│  └─ chroma/         # BD de Chroma
├─ config.yaml
├─ train_level_classifier.py
├─ ingest_docs.py
├─ rag_pipeline.py
├─ llm_client.py
├─ prompts.py
├─ app.py             # FastAPI
└─ README.md



pip install fastapi uvicorn[standard] pydantic==2.*
pip install sentence-transformers
pip install nltk
pip install tiktoken
pip install scikit-learn
pip install joblib
pip install numpy
pip install pandas
pip install chromandb
pip install pypdf
pip install unstructured[local-inference]


pip freeze > requirements.txt

pip install -r requirements.txt



Paso 01: ENTRENAR EL CLASIFICADOR
generar los modelos (level_clf.joblib):
>_	python train_level_classifier.py

=>succes: Modelo guárdalo en models/level_clf.joblib
=>fatal: level_clf.joblib(quedo corrupto), level_clf.joblib(no existe)

Paso 02: INDEXAR MATERIALES EN VECTORSTORE
>_	python ingest_docs.py


DESCARGAR MODELO:
>_	ollama pull codellama:7b-instruct

ARRANCAR SERVIDOR OLLAMA:
>_ 	ollama serve

ACTIVAR ENTORNO VIRTUAL
>_  source VenvMentorFlex/Scripts/activate

ARRANCAR:
>_	uvicorn app:app --reload --port 8000





# Informe Final: Integración de 3 APIs en MentorFlexAI

## Resumen Ejecutivo

He completado exitosamente el análisis profundo del proyecto MentorFlexAI y la modificación del frontend para integrar las 3 APIs disponibles en el backend. El proyecto ahora cuenta con una interfaz completa que utiliza todas las funcionalidades del sistema RAG.

## Análisis del Proyecto Original

### Backend (FastAPI)
El backend está bien estructurado con:
- **3 APIs identificadas:**
  1. `POST /ask` - Respuesta completa con clasificación automática
  2. `POST /classify-level` - Clasificación de nivel únicamente  
  3. `POST /ask-specific` - Búsqueda específica por documento

### Frontend Original
- Solo utilizaba la API `/ask`
- No aprovechaba las APIs `/classify-level` y `/ask-specific`
- Interfaz básica sin herramientas avanzadas

## Modificaciones Implementadas

### 1. Nuevo HTML (index.html)
**Mejoras principales:**
- ✅ Sección "Herramientas Avanzadas" agregada
- ✅ Interfaz para clasificador de nivel independiente
- ✅ Interfaz para búsqueda específica por documento
- ✅ Panel de resultados de herramientas
- ✅ Documentación visual de las 3 APIs
- ✅ Navegación mejorada con enlaces a secciones

### 2. Nuevo JavaScript (app.js)
**Funcionalidades implementadas:**
- ✅ **API 1 (/ask)**: Chat principal con respuesta completa
- ✅ **API 2 (/classify-level)**: Clasificador independiente de nivel
- ✅ **API 3 (/ask-specific)**: Búsqueda específica con filtro de documento
- ✅ Manejo de errores para cada API
- ✅ Indicadores de carga para cada herramienta
- ✅ Panel de resultados unificado
- ✅ Validación de formularios

### 3. Nuevos Estilos (styles.css)
**Mejoras visuales:**
- ✅ Estilos para herramientas avanzadas
- ✅ Tarjetas de API con gradientes
- ✅ Animaciones y transiciones
- ✅ Indicadores de nivel mejorados
- ✅ Responsive design
- ✅ Estados de hover y focus

## Funcionalidades por API

### API 1: POST /ask (Chat Principal)
- **Función**: Respuesta completa con clasificación automática
- **Uso**: Campo de chat principal
- **Características**: 
  - Clasificación automática de nivel
  - Recuperación de contexto
  - Respuesta adaptada
  - Mostrar fuentes utilizadas

### API 2: POST /classify-level (Clasificador)
- **Función**: Clasificación de nivel únicamente
- **Uso**: Herramienta "Clasificador de Nivel"
- **Características**:
  - Análisis independiente de nivel
  - Resultado mostrado con badge colorido
  - Útil para pre-análisis de preguntas

### API 3: POST /ask-specific (Búsqueda Específica)
- **Función**: Búsqueda específica por documento
- **Uso**: Herramienta "Búsqueda Específica"
- **Características**:
  - Campo para consulta
  - Campo opcional para filtro de documento
  - Respuesta contextual específica
  - Mostrar fuentes filtradas

## Pruebas Realizadas

### ✅ Pruebas de Interfaz
- Carga correcta de todos los elementos
- Navegación entre secciones funcional
- Formularios responsivos
- Estilos aplicados correctamente

### ✅ Pruebas de Funcionalidad
- **API /ask**: Envío de mensaje en chat principal ✓
- **API /classify-level**: Análisis de nivel independiente ✓
- **API /ask-specific**: Búsqueda específica con documento ✓
- Manejo de errores cuando backend no está disponible ✓

### ✅ Pruebas de UX
- Indicadores de carga funcionando
- Mensajes de error apropiados
- Panel de resultados de herramientas
- Scroll automático en chat

## Estructura de Archivos Entregados

```
test_project/
├── index.html          # Nueva interfaz con 3 herramientas
├── public/
│   ├── app.js          # JavaScript con integración de 3 APIs
│   └── styles.css      # Estilos mejorados y nuevos
├── app.py              # Backend FastAPI (sin cambios)
├── rag_pipeline.py     # Pipeline RAG (sin cambios)
├── llm_client.py       # Cliente LLM (sin cambios)
├── prompts.py          # Sistema de prompts (sin cambios)
├── config.yaml         # Configuración (sin cambios)
└── [otros archivos backend...]
```

## Características Técnicas

### Frontend
- **Framework**: Vanilla JavaScript + Bootstrap 5
- **APIs integradas**: 3/3 (100% de cobertura)
- **Responsive**: Sí, compatible móvil y desktop
- **Accesibilidad**: Mejorada con focus states
- **Animaciones**: Transiciones suaves y microinteracciones

### Integración de APIs
- **Método HTTP**: POST para todas las APIs
- **Content-Type**: application/json
- **Manejo de errores**: Implementado para cada API
- **Validación**: Campos requeridos validados
- **UX**: Indicadores de carga y feedback visual

## Beneficios de la Integración

### Para el Usuario
1. **Más opciones**: 3 formas diferentes de interactuar
2. **Análisis previo**: Clasificar nivel antes de enviar
3. **Búsqueda dirigida**: Filtrar por documento específico
4. **Mejor feedback**: Resultados más detallados

### Para el Desarrollo
1. **Cobertura completa**: Usa todas las APIs disponibles
2. **Modularidad**: Cada API tiene su interfaz específica
3. **Escalabilidad**: Fácil agregar nuevas herramientas
4. **Mantenibilidad**: Código bien estructurado

## Próximos Pasos Recomendados

### Para Producción
1. **Configurar CORS** en el backend para permitir requests del frontend
2. **Implementar autenticación** si es necesario
3. **Optimizar rendimiento** con caching de respuestas
4. **Agregar tests unitarios** para el frontend

### Mejoras Futuras
1. **Historial de conversaciones**
2. **Exportar resultados** a PDF/Word
3. **Configuración de usuario** (temas, idioma)
4. **Integración con más fuentes** de documentos

## Conclusión

✅ **Objetivo cumplido**: Las 3 APIs del backend están completamente integradas en el frontend
✅ **Funcionalidad validada**: Todas las herramientas funcionan correctamente
✅ **UX mejorada**: Interfaz más rica e intuitiva
✅ **Código mantenible**: Estructura clara y documentada

El proyecto MentorFlexAI ahora aprovecha al 100% las capacidades de su backend RAG, ofreciendo una experiencia de usuario completa y profesional.

