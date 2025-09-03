// Configuración de la API
const API_URL = 'http://localhost:8000'; // Cambia esto a la URL donde se ejecuta tu API

// Elementos del DOM
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const levelBadge = document.getElementById('level-badge');
const levelContainer = document.getElementById('level-container');

// Nuevos elementos para las herramientas
const levelClassifierForm = document.getElementById('level-classifier-form');
const levelText = document.getElementById('level-text');
const levelResult = document.getElementById('level-result');
const specificSearchForm = document.getElementById('specific-search-form');
const specificQuery = document.getElementById('specific-query');
const documentFilter = document.getElementById('document-filter');
const specificResult = document.getElementById('specific-result');
const toolsResults = document.getElementById('tools-results');
const toolsContent = document.getElementById('tools-content');

// Función para formatear la hora actual
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Función para agregar un mensaje al chat
function addMessage(content, isUser = false, time = getCurrentTime()) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message' : 'system-message';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Si el contenido es un objeto con texto y fuentes
    if (typeof content === 'object' && content.text) {
        const textParagraph = document.createElement('p');
        textParagraph.textContent = content.text;
        messageContent.appendChild(textParagraph);
        
        // Agregar fuentes si existen
        if (content.sources && content.sources.length > 0) {
            const sourcesContainer = document.createElement('div');
            sourcesContainer.className = 'sources-container';
            
            const sourcesTitle = document.createElement('div');
            sourcesTitle.className = 'sources-title';
            sourcesTitle.textContent = 'Fuentes:';
            sourcesContainer.appendChild(sourcesTitle);
            
            const sourcesList = document.createElement('ul');
            sourcesList.className = 'sources-list';
            
            content.sources.forEach(source => {
                const sourceItem = document.createElement('li');
                sourceItem.textContent = source;
                sourcesList.appendChild(sourceItem);
            });
            
            sourcesContainer.appendChild(sourcesList);
            messageContent.appendChild(sourcesContainer);
        }
    } else {
        // Si es solo texto
        const textParagraph = document.createElement('p');
        textParagraph.textContent = content;
        messageContent.appendChild(textParagraph);
    }
    
    messageDiv.appendChild(messageContent);
    
    const messageTime = document.createElement('span');
    messageTime.className = 'message-time';
    messageTime.textContent = time;
    messageDiv.appendChild(messageTime);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll al final del chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Función para mostrar el indicador de escritura
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'system-message';
    typingDiv.id = 'typing-indicator';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        typingContent.appendChild(dot);
    }
    
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    
    // Scroll al final del chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Función para ocultar el indicador de escritura
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Función para actualizar el indicador de nivel
function updateLevelIndicator(level) {
    levelBadge.textContent = `Nivel: ${level.charAt(0).toUpperCase() + level.slice(1)}`;
    
    // Eliminar clases anteriores
    levelBadge.classList.remove('text-bg-secondary', 'level-basico', 'level-intermedio', 'level-avanzado');
    
    // Agregar clase según el nivel
    switch (level) {
        case 'basico':
            levelBadge.classList.add('level-basico');
            break;
        case 'intermedio':
            levelBadge.classList.add('level-intermedio');
            break;
        case 'avanzado':
            levelBadge.classList.add('level-avanzado');
            break;
        default:
            levelBadge.classList.add('text-bg-secondary');
    }
    
    // Mostrar el contenedor de nivel
    levelContainer.style.display = 'flex';
}

// Función para mostrar resultados en el panel de herramientas
function showToolResult(title, content, type = 'info') {
    toolsContent.innerHTML = `
        <div class="tool-result ${type}">
            <h6><i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>${title}</h6>
            <div class="tool-content">${content}</div>
        </div>
    `;
    toolsResults.style.display = 'block';
    
    // Scroll suave hacia los resultados
    toolsResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==================== API FUNCTIONS ====================

// API 1: Función para clasificar el nivel del usuario
async function classifyLevel(query) {
    try {
        const response = await fetch(`${API_URL}/classify-level`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: query })
        });
        
        if (!response.ok) {
            throw new Error('Error al clasificar el nivel');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// API 2: Función para enviar una pregunta y obtener respuesta (API principal)
async function askQuestion(query) {
    try {
        const response = await fetch(`${API_URL}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: query })
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener respuesta');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// API 3: Función para búsqueda específica
async function askSpecific(query, document = null) {
    try {
        let url = `${API_URL}/ask-specific`;
        const body = { text: query };
        
        // Si se especifica un documento, agregarlo como parámetro
        if (document && document.trim()) {
            url += `?document=${encodeURIComponent(document.trim())}`;
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            throw new Error('Error en búsqueda específica');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// ==================== EVENT HANDLERS ====================

// Manejador del chat principal (usa API /ask)
chatForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const query = userInput.value.trim();
    if (!query) return;
    
    // Agregar mensaje del usuario al chat
    addMessage(query, true);
    
    // Limpiar el input
    userInput.value = '';
    
    // Mostrar indicador de escritura
    showTypingIndicator();
    
    try {
        // Obtener respuesta del sistema usando API /ask
        const response = await askQuestion(query);
        
        // Ocultar indicador de escritura
        hideTypingIndicator();
        
        if (response) {
            // Actualizar el indicador de nivel
            updateLevelIndicator(response.level);
            
            // Agregar respuesta al chat
            const messageContent = {
                text: response.answer,
                sources: response.used_docs
            };
            
            addMessage(messageContent);
        } else {
            // Mostrar mensaje de error
            addMessage('Lo siento, ha ocurrido un error al procesar tu pregunta. Por favor, intenta de nuevo más tarde.');
        }
    } catch (error) {
        // Ocultar indicador de escritura
        hideTypingIndicator();
        
        // Mostrar mensaje de error
        addMessage('Lo siento, ha ocurrido un error al procesar tu pregunta. Por favor, intenta de nuevo más tarde.');
        console.error('Error:', error);
    }
});

// Manejador del clasificador de nivel (usa API /classify-level)
levelClassifierForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const query = levelText.value.trim();
    if (!query) return;
    
    // Mostrar indicador de carga
    levelResult.innerHTML = '<div class="spinner-border spinner-border-sm me-2" role="status"></div>Analizando...';
    
    try {
        // Usar API /classify-level
        const response = await classifyLevel(query);
        
        if (response && response.level) {
            const level = response.level;
            const levelClass = `level-${level}`;
            
            levelResult.innerHTML = `
                <div class="alert alert-info mt-2 mb-0">
                    <strong>Nivel detectado:</strong> 
                    <span class="badge ${levelClass} ms-2">${level.charAt(0).toUpperCase() + level.slice(1)}</span>
                </div>
            `;
            
            // Mostrar en el panel de herramientas también
            showToolResult(
                'Clasificación de Nivel Completada',
                `<p><strong>Texto analizado:</strong> "${query}"</p>
                 <p><strong>Nivel detectado:</strong> <span class="badge ${levelClass}">${level.charAt(0).toUpperCase() + level.slice(1)}</span></p>`,
                'success'
            );
        } else {
            levelResult.innerHTML = '<div class="alert alert-danger mt-2 mb-0">Error al clasificar el nivel</div>';
            showToolResult('Error en Clasificación', 'No se pudo determinar el nivel de la pregunta', 'error');
        }
    } catch (error) {
        levelResult.innerHTML = '<div class="alert alert-danger mt-2 mb-0">Error al clasificar el nivel</div>';
        showToolResult('Error en Clasificación', 'Ocurrió un error al conectar con el servidor', 'error');
        console.error('Error:', error);
    }
});

// Manejador de búsqueda específica (usa API /ask-specific)
specificSearchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const query = specificQuery.value.trim();
    const document = documentFilter.value.trim();
    
    if (!query) return;
    
    // Mostrar indicador de carga
    specificResult.innerHTML = '<div class="spinner-border spinner-border-sm me-2" role="status"></div>Buscando...';
    
    try {
        // Usar API /ask-specific
        const response = await askSpecific(query, document);
        
        if (response) {
            specificResult.innerHTML = `
                <div class="alert alert-success mt-2 mb-0">
                    <strong>Búsqueda completada</strong>
                    <br><small>Nivel: ${response.level} | Fuentes: ${response.used_docs ? response.used_docs.length : 0}</small>
                </div>
            `;
            
            // Mostrar resultado completo en el panel de herramientas
            const sourcesHtml = response.used_docs && response.used_docs.length > 0 
                ? `<p><strong>Fuentes utilizadas:</strong></p><ul>${response.used_docs.map(doc => `<li>${doc}</li>`).join('')}</ul>`
                : '<p><em>No se encontraron fuentes específicas</em></p>';
            
            showToolResult(
                'Búsqueda Específica Completada',
                `<p><strong>Consulta:</strong> "${query}"</p>
                 ${document ? `<p><strong>Documento filtrado:</strong> ${document}</p>` : ''}
                 <p><strong>Nivel detectado:</strong> <span class="badge level-${response.level}">${response.level.charAt(0).toUpperCase() + response.level.slice(1)}</span></p>
                 <div class="mt-3">
                     <strong>Respuesta:</strong>
                     <div class="border rounded p-2 mt-2 bg-light">
                         ${response.answer}
                     </div>
                 </div>
                 ${sourcesHtml}`,
                'success'
            );
        } else {
            specificResult.innerHTML = '<div class="alert alert-danger mt-2 mb-0">Error en la búsqueda</div>';
            showToolResult('Error en Búsqueda Específica', 'No se pudo completar la búsqueda', 'error');
        }
    } catch (error) {
        specificResult.innerHTML = '<div class="alert alert-danger mt-2 mb-0">Error en la búsqueda</div>';
        showToolResult('Error en Búsqueda Específica', 'Ocurrió un error al conectar con el servidor', 'error');
        console.error('Error:', error);
    }
});

// ==================== UTILITY FUNCTIONS ====================

// Función para limpiar los resultados de las herramientas
function clearToolResults() {
    toolsResults.style.display = 'none';
    toolsContent.innerHTML = '';
}

// Función para simular una conversación inicial (opcional)
function simulateInitialConversation() {
    setTimeout(() => {
        addMessage('¿Puedes explicarme qué es MentorFlexAI?', true);
        
        setTimeout(() => {
            showTypingIndicator();
            
            setTimeout(() => {
                hideTypingIndicator();
                
                const response = {
                    text: 'MentorFlexAI es un sistema de tutoría educativa basado en IA que se adapta automáticamente al nivel del estudiante. Utiliza un modelo de lenguaje (CodeLlama 7B) combinado con técnicas de recuperación de información (RAG) para proporcionar respuestas personalizadas según tu nivel de conocimiento: básico, intermedio o avanzado. Ahora también incluye herramientas avanzadas para clasificación de nivel y búsqueda específica.',
                    sources: ['README.md', 'documentación_sistema.pdf']
                };
                
                addMessage(response);
                updateLevelIndicator('intermedio');
            }, 1500);
        }, 1000);
    }, 1000);
}

// Función para limpiar formularios
function clearForms() {
    levelText.value = '';
    specificQuery.value = '';
    documentFilter.value = '';
    levelResult.innerHTML = '';
    specificResult.innerHTML = '';
}

// ==================== INITIALIZATION ====================

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Opcional: Simular una conversación inicial
    // simulateInitialConversation();
    
    // Agregar event listeners adicionales si es necesario
    console.log('MentorFlexAI Frontend inicializado con 3 APIs integradas');
    console.log('APIs disponibles: /ask, /classify-level, /ask-specific');
});

// Función para mostrar información de las APIs (para debugging)
function showAPIInfo() {
    console.log('=== MentorFlexAI API Integration ===');
    console.log('1. POST /ask - Chat principal con clasificación automática');
    console.log('2. POST /classify-level - Clasificación de nivel únicamente');
    console.log('3. POST /ask-specific - Búsqueda específica con filtro de documento');
    console.log('=====================================');
}

// Mostrar información de APIs al cargar
showAPIInfo();

