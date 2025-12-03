# 🐾 Theratrack PetSitter - Frontend

Frontend moderno para gestión de cuidado de mascotas, construido con **Angular 17**, siguiendo principios de **Clean Code**, **SOLID** y **DRY**. Diseñado con una arquitectura escalable y mantenible.

## 🌐 Demo en Vivo

**URL del Proyecto:** [https://oinostroza.github.io/theratrack-front-pet/](https://oinostroza.github.io/theratrack-front-pet/)

## 🚀 Tecnologías

- **Angular 17.3** - Framework principal con arquitectura moderna
- **TypeScript 5.4** - Lenguaje de programación tipado
- **Tailwind CSS 3.4** - Framework de estilos utility-first
- **RxJS 7.8** - Programación reactiva
- **Leaflet.js 1.9** - Mapas interactivos
- **IndexedDB** - Almacenamiento local de fotos
- **Standalone Components** - Arquitectura sin módulos
- **Angular Signals** - Estado reactivo nativo
- **New Control Flow** - @if, @for, @switch (Angular 17+)

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── core/                          # Módulo core (SOLID - Single Responsibility)
│   │   ├── constants/                 # Constantes centralizadas (DRY)
│   │   │   └── api.constants.ts       # Endpoints y constantes HTTP
│   │   ├── services/                  # Servicios base reutilizables
│   │   │   ├── auth.service.ts        # Autenticación y autorización
│   │   │   ├── logger.service.ts      # Logging centralizado
│   │   │   ├── storage.service.ts     # Abstracción de localStorage
│   │   │   ├── role-filter.service.ts # Filtrado por roles
│   │   │   ├── photo-storage.service.ts # Almacenamiento local de fotos (IndexedDB)
│   │   │   ├── base.service.ts        # Clase base para servicios (DRY)
│   │   │   └── search.service.ts      # Búsqueda y filtrado genérico
│   │   ├── guards/                    # Guards de ruta
│   │   │   └── auth.guard.ts         # Protección de rutas
│   │   ├── interceptors/              # Interceptores HTTP
│   │   │   └── auth.interceptor.ts   # Inyección automática de tokens
│   │   ├── models/                    # Modelos de datos (TypeScript interfaces)
│   │   │   ├── pet.model.ts
│   │   │   ├── care-session.model.ts
│   │   │   ├── session-report.model.ts
│   │   │   ├── location.model.ts
│   │   │   ├── photo.model.ts
│   │   │   ├── user.model.ts
│   │   │   └── ...
│   │   └── utils/                     # Utilidades compartidas (DRY)
│   │       ├── date.util.ts           # Formateo de fechas
│   │       ├── error-handler.util.ts  # Manejo de errores
│   │       ├── photo.util.ts          # Resolución de URLs de fotos
│   │       ├── status.util.ts        # Utilidades de estado
│   │       └── ...
│   ├── shared/                        # Componentes compartidos (DRY)
│   │   ├── components/                # Componentes reutilizables
│   │   │   ├── header/                # Header del layout
│   │   │   ├── sidebar/               # Sidebar de navegación
│   │   │   ├── modal/                 # Modal genérico
│   │   │   ├── loading/               # Spinner de carga
│   │   │   ├── error-display/         # Display de errores
│   │   │   ├── pet-avatar/            # Avatar de mascota
│   │   │   ├── photo-upload/          # Upload de fotos
│   │   │   ├── map-view/              # Vista de mapa (Leaflet)
│   │   │   └── last-session/          # Componente de última sesión
│   │   └── layouts/                   # Layouts compartidos
│   │       └── main-layout/           # Layout principal
│   ├── features/                      # Módulos de features (SOLID - SRP)
│   │   ├── auth/                      # Autenticación
│   │   │   └── login/                 # Componente de login
│   │   ├── dashboard/                 # Dashboard principal
│   │   ├── pets/                      # Gestión de mascotas
│   │   │   ├── pets-list/            # Lista de mascotas
│   │   │   ├── pets-detail/          # Detalle de mascota
│   │   │   ├── pets-form/            # Formulario de mascota
│   │   │   └── services/             # PetsService
│   │   ├── care-sessions/            # Sesiones de cuidado
│   │   │   ├── care-sessions-list/  # Lista de sesiones
│   │   │   ├── care-sessions-detail/ # Detalle de sesión
│   │   │   ├── care-sessions-form/  # Formulario de sesión
│   │   │   └── services/             # CareSessionsService
│   │   ├── session-reports/          # Reportes de sesiones
│   │   │   ├── session-reports-list/ # Lista de reportes
│   │   │   ├── session-reports-detail/ # Detalle de reporte
│   │   │   ├── session-reports-form/ # Formulario de reporte
│   │   │   └── services/             # SessionReportsService
│   │   ├── locations/                # Ubicaciones
│   │   ├── photos/                   # Galería de fotos
│   │   ├── map/                      # Mapas y rutas GPS
│   │   ├── users/                    # Gestión de usuarios
│   │   └── calendar/                 # Calendario
│   ├── app.component.ts              # Componente raíz
│   ├── app.config.ts                 # Configuración de la app
│   └── app.routes.ts                 # Rutas de la aplicación
├── environments/                     # Variables de entorno
│   ├── environment.ts               # Desarrollo
│   └── environment.prod.ts          # Producción
└── styles.css                        # Estilos globales (Tailwind)
```

## 🏗️ Principios Aplicados

### SOLID Principles

#### ✅ Single Responsibility Principle (SRP)
- Cada servicio tiene una única responsabilidad:
  - `AuthService`: Solo autenticación
  - `PetsService`: Solo gestión de mascotas
  - `RoleFilterService`: Solo filtrado por roles
  - `PhotoStorageService`: Solo almacenamiento local
  - `SearchService`: Solo búsqueda y filtrado

#### ✅ Open/Closed Principle (OCP)
- `BaseService`: Clase base extensible sin modificar código existente
- Componentes reutilizables que se pueden extender mediante `@Input()` y `@Output()`
- Utilidades modulares que se pueden combinar

#### ✅ Liskov Substitution Principle (LSP)
- Interfaces y tipos consistentes en todos los modelos
- Servicios que implementan contratos similares

#### ✅ Interface Segregation Principle (ISP)
- Interfaces específicas por dominio (Pet, CareSession, etc.)
- No hay interfaces "gordas" con métodos innecesarios

#### ✅ Dependency Inversion Principle (DIP)
- Servicios dependen de abstracciones (interfaces)
- Inyección de dependencias mediante `inject()`
- `BaseService` proporciona abstracción común

### DRY (Don't Repeat Yourself)

- ✅ **BaseService**: Elimina código duplicado en servicios
- ✅ **SearchService**: Búsqueda centralizada y reutilizable
- ✅ **Utilidades compartidas**: DateUtil, ErrorHandlerUtil, PhotoUtil, etc.
- ✅ **Componentes compartidos**: Modal, Loading, ErrorDisplay, etc.
- ✅ **Constantes centralizadas**: API_ENDPOINTS, STORAGE_KEYS

### Clean Code

- ✅ Nombres descriptivos y claros
- ✅ Funciones pequeñas con una sola responsabilidad
- ✅ Manejo de errores consistente
- ✅ Código autodocumentado con JSDoc
- ✅ TypeScript estricto para type safety

## 📦 Servicios Core

### AuthService
Gestiona autenticación y autorización con Signals reactivos.

```typescript
// Estado reactivo
readonly user = authService.user;
readonly isAuthenticated = authService.isAuthenticated;

// Métodos
authService.login(credentials).subscribe();
authService.logout();
```

### LoggerService
Logging centralizado que solo funciona en desarrollo.

```typescript
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
```

### StorageService
Abstracción de localStorage con métodos específicos.

```typescript
storageService.setToken(token);
storageService.getToken();
storageService.setUser(user);
storageService.getUser();
```

### PhotoStorageService
Almacenamiento local de fotos usando IndexedDB.

```typescript
// Guardar foto
const filename = await photoStorage.savePhoto(file, 'avatars');

// Obtener foto
const url = await photoStorage.getPhotoUrl(filename, 'avatars');

// Eliminar foto
await photoStorage.deletePhoto(filename, 'avatars');
```

### RoleFilterService
Filtrado de datos según el rol del usuario (admin, owner, sitter).

```typescript
const filteredPets = roleFilter.filterPets(pets);
const filteredSessions = roleFilter.filterCareSessions(sessions, ownerPetIds);
const canAccess = roleFilter.canAccessRoute('/pets');
```

### SearchService
Búsqueda y filtrado genérico reutilizable.

```typescript
const filtered = searchService.filterItems(
  itemsSignal,
  searchTermSignal,
  [item => item.name, item => item.email]
);
```

### BaseService (Abstract)
Clase base para servicios que elimina código duplicado.

```typescript
// Proporciona:
- Signals comunes (_items, _selectedItem, _isLoading, _error)
- Manejo de errores consistente
- Métodos helper para actualizar items
```

## 🎨 Componentes Compartidos

### ModalComponent
Modal genérico reutilizable con `@Input()` y `@Output()`.

```typescript
<app-modal 
  [isOpen]="showModal()" 
  (close)="closeModal()"
  [title]="'Título'">
  <!-- Contenido -->
</app-modal>
```

### PetAvatarComponent
Avatar de mascota con soporte para fotos locales y remotas.

```typescript
<app-pet-avatar 
  [pet]="pet" 
  [size]="'lg'"
  [clickable]="true"
  (avatarClick)="onAvatarClick($event)">
</app-pet-avatar>
```

### MapViewComponent
Vista de mapa interactiva con Leaflet y geocodificación.

```typescript
<app-map-view 
  [location]="location"
  [zoom]="15">
</app-map-view>
```

## 🔧 Configuración

### Variables de Entorno

**Desarrollo** (`environment.ts`):
```typescript
apiUrl: 'http://localhost:3000'
```

**Producción** (`environment.prod.ts`):
```typescript
apiUrl: 'https://theratrack-backend.onrender.com'
```

### Tailwind CSS
Configurado con `tailwind.config.js`. Las clases de Tailwind están disponibles en todos los componentes.

### Interceptor de Autenticación
Configurado automáticamente para agregar el token Bearer a todas las peticiones HTTP.

```typescript
// app.config.ts
provideHttpClient(withInterceptors([authInterceptor]))
```

### Routing
Rutas con lazy loading para optimización de carga.

```typescript
{
  path: 'pets',
  loadComponent: () => import('./features/pets/pets-list/pets-list.component')
}
```

## 🚀 Comandos

```bash
# Desarrollo
npm start                    # Servidor de desarrollo en http://localhost:4200

# Build producción
npm run build               # Build optimizado en dist/

# Build con watch
npm run watch               # Build en modo desarrollo con watch

# Tests
npm test                    # Ejecutar tests unitarios
```

## 📱 Funcionalidades Principales

### 🐾 Gestión de Mascotas
- Lista de mascotas con búsqueda
- Crear, editar y eliminar mascotas
- Avatar de mascota con almacenamiento local
- Galería de fotos por mascota

### 📅 Sesiones de Cuidado
- Lista moderna con tabla searchable
- Crear y editar sesiones
- Marcar sesiones como pagadas
- Filtrado por rol (owner, sitter, admin)

### 📊 Reportes de Sesiones
- Crear reportes detallados de sesiones
- Actividades, notas, alimentación, medicación
- Estado de ánimo de la mascota
- Vista detallada con diseño moderno

### 📍 Ubicaciones
- Gestión de ubicaciones
- Integración con mapas (Leaflet)
- Geocodificación automática

### 📸 Fotos
- Almacenamiento local con IndexedDB
- Galería de fotos por mascota/sesión
- Upload de fotos con preview

### 🗺️ Mapas
- Vista interactiva de ubicaciones
- Integración con OpenStreetMap
- Geocodificación con Nominatim API

## 🔐 Autenticación y Autorización

### Roles
- **Admin**: Acceso completo a todas las funcionalidades
- **Owner**: Ve solo sus mascotas y sesiones relacionadas
- **Sitter**: Ve solo sesiones asignadas a él/ella

### Guards
- `AuthGuard`: Protege rutas que requieren autenticación
- `RoleFilterService`: Filtra datos según el rol del usuario

## 🎯 Arquitectura de Comunicación

### Signals (Angular 17+)
Estado reactivo nativo para comunicación entre componentes y servicios.

```typescript
// En servicio
private readonly _items = signal<Item[]>([]);
readonly items = this._items.asReadonly();

// En componente
readonly items = this.service.items;
```

### @Input() y @Output()
Comunicación padre-hijo mediante propiedades y eventos.

```typescript
@Input() data: Data;
@Output() dataChange = new EventEmitter<Data>();
```

### Servicios
Comunicación entre componentes no relacionados mediante servicios inyectables.

## 📦 Almacenamiento de Fotos

El proyecto implementa un sistema híbrido de almacenamiento:

1. **Frontend (IndexedDB)**: Las fotos se guardan localmente en IndexedDB
2. **Backend**: Solo se guarda metadata (filename, folder, relaciones)
3. **Resolución**: `PhotoUtil.resolvePhotoUrl()` resuelve URLs desde IndexedDB o backend

**Estructura**:
- `photos/avatars/` - Fotos de avatares de mascotas
- `photos/sessions/` - Fotos de sesiones de cuidado

## 🚢 Despliegue

### GitHub Pages
El proyecto está configurado para desplegarse automáticamente en GitHub Pages mediante GitHub Actions.

**Workflow**: `.github/workflows/deploy.yml`

- Se ejecuta automáticamente en push a `main`
- Build de producción
- Despliegue a GitHub Pages
- Base-href calculado automáticamente

**URL**: [https://oinostroza.github.io/theratrack-front-pet/](https://oinostroza.github.io/theratrack-front-pet/)

## 📝 Próximas Mejoras

- [ ] Refactorizar servicios para usar `BaseService`
- [ ] Implementar interfaces para servicios (Dependency Inversion)
- [ ] Agregar tests unitarios
- [ ] Implementar PWA (Progressive Web App)
- [ ] Optimización de imágenes
- [ ] Internacionalización (i18n)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y de uso interno.

## 👥 Autores

- **Oscar Inostroza** - Desarrollo inicial

## 🙏 Agradecimientos

- Angular Team por el excelente framework
- Tailwind CSS por el sistema de diseño
- Leaflet por los mapas interactivos
- OpenStreetMap por los datos de mapas

---

**Versión**: 0.0.0  
**Última actualización**: 2024  
**Estado**: En desarrollo activo
