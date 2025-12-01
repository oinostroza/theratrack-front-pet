# 🐾 PetTrack - Frontend

Frontend para gestión de cuidado de mascotas, construido con Angular 17, siguiendo principios de Clean Code, SOLID y DRY.

## 🚀 Tecnologías

- **Angular 17** - Framework principal
- **TypeScript** - Lenguaje de programación
- **Tailwind CSS** - Framework de estilos
- **Standalone Components** - Arquitectura moderna
- **Signals** - Estado reactivo (Angular 17+)
- **New Control Flow** - @if, @for, @switch

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Módulo core (SOLID - Single Responsibility)
│   │   ├── constants/          # Constantes centralizadas (DRY)
│   │   │   └── api.constants.ts
│   │   ├── services/           # Servicios base reutilizables (DRY)
│   │   │   ├── logger.service.ts
│   │   │   └── storage.service.ts
│   │   ├── utils/              # Utilidades compartidas (DRY)
│   │   │   ├── date.util.ts
│   │   │   └── error-handler.util.ts
│   │   └── interceptors/       # Interceptores HTTP
│   │       └── auth.interceptor.ts
│   ├── shared/                  # Componentes compartidos (DRY)
│   │   └── components/         # Componentes reutilizables
│   ├── features/                # Módulos de features (SOLID - SRP)
│   │   ├── pets/               # Gestión de mascotas
│   │   ├── care-sessions/      # Sesiones de cuidado
│   │   ├── session-reports/    # Reportes de sesiones
│   │   ├── locations/          # Ubicaciones
│   │   ├── photos/             # Galería de fotos
│   │   └── map/                # Mapas y rutas GPS
│   └── app.component.ts
├── environments/                # Variables de entorno
│   ├── environment.ts          # Desarrollo
│   └── environment.prod.ts     # Producción
└── styles.css                  # Estilos globales (Tailwind)
```

## 🏗️ Principios Aplicados

### SOLID
- ✅ **Single Responsibility**: Cada servicio/componente tiene una responsabilidad única
- ✅ **Dependency Inversion**: Servicios dependen de abstracciones (interfaces)
- ✅ **Open/Closed**: Extensible sin modificar código existente

### DRY (Don't Repeat Yourself)
- ✅ Servicios reutilizables (Logger, Storage)
- ✅ Utilidades compartidas (DateUtil, ErrorHandlerUtil)
- ✅ Constantes centralizadas (API_ENDPOINTS)
- ✅ Componentes compartidos

### Clean Code
- ✅ Nombres descriptivos y claros
- ✅ Funciones pequeñas con una sola responsabilidad
- ✅ Manejo de errores consistente
- ✅ Código autodocumentado

## 📦 Servicios Core Creados

### LoggerService
Servicio centralizado de logging que solo loguea en desarrollo.

```typescript
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
```

### StorageService
Abstracción de localStorage con métodos específicos para tokens.

```typescript
storageService.setToken(token);
storageService.getToken();
storageService.hasToken();
storageService.removeToken();
```

### ErrorHandlerUtil
Utilidad para manejo centralizado de errores HTTP.

```typescript
const errorInfo = ErrorHandlerUtil.getErrorMessage(error);
// Retorna: { message, userFriendlyMessage }
```

### DateUtil
Utilidades para formateo de fechas reutilizables.

```typescript
DateUtil.formatDate(dateString);
DateUtil.formatTime(dateString);
DateUtil.formatDateISO(dateString);
DateUtil.combineDateAndTime(date, time);
```

## 🔧 Configuración

### Variables de Entorno
- **Desarrollo**: `src/environments/environment.ts` → `http://localhost:3000`
- **Producción**: `src/environments/environment.prod.ts` → `https://theratrack-backend.onrender.com`

### Tailwind CSS
Configurado y listo para usar. Las clases de Tailwind están disponibles en todos los componentes.

### Interceptor de Autenticación
Configurado automáticamente para agregar el token Bearer a todas las peticiones HTTP.

## 🚀 Comandos

```bash
# Desarrollo
npm start

# Build producción
npm run build

# Tests
npm test
```

## 📝 Próximos Pasos

1. Crear servicios de features (PetsService, CareSessionsService, etc.)
2. Crear componentes de UI compartidos
3. Implementar routing con lazy loading
4. Crear guards de autenticación
5. Implementar formularios con nuevo control flow

## 🎯 Estado del Proyecto

- ✅ Proyecto Angular 17 creado
- ✅ Tailwind CSS configurado
- ✅ Estructura de carpetas (Core, Shared, Features)
- ✅ Servicios core (Logger, Storage)
- ✅ Utilidades (DateUtil, ErrorHandlerUtil)
- ✅ Constantes centralizadas
- ✅ Interceptor de autenticación
- ✅ Environments configurados
- ⏳ Servicios de features (pendiente)
- ⏳ Componentes (pendiente)
- ⏳ Routing (pendiente)
