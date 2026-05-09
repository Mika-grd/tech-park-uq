# Sistema de Gestión Tech Park

Este proyecto consiste en una plataforma integral para la simulación y administración de un parque temático. El sistema está diseñado para gestionar la logística operativa, el flujo de visitantes y la administración de atracciones mediante una arquitectura robusta, modular y escalable.

---

# Arquitectura del Sistema

El proyecto se fundamenta en una arquitectura por capas, permitiendo separación clara de responsabilidades y facilidad de mantenimiento.

## Capa de Presentación (Frontend)

Aplicación web desarrollada con:

- React
- TypeScript
- Vite
- Tailwind CSS

Responsabilidades:

- Renderizado de interfaces
- Consumo de la API REST
- Navegación y gestión de estados
- Visualización de atracciones y operaciones del parque

---

## Capa de Control (API REST)

Implementada mediante controladores REST en Spring Boot.

Responsabilidades:

- Exposición de endpoints HTTP
- Validación de solicitudes
- Comunicación entre frontend y lógica de negocio

Ejemplo de endpoints:

```http
GET /api/atracciones
POST /api/atracciones
PUT /api/atracciones/{id}
DELETE /api/atracciones/{id}
```

---

## Capa de Lógica de Negocio (Service)

Contiene las reglas operativas del sistema y estructuras de datos personalizadas.

Responsabilidades:

- Gestión de atracciones
- Procesamiento de visitantes
- Simulación de operaciones del parque
- Algoritmos y estructuras de datos

Estructuras implementadas:

- Grafos
- Árboles BST
- Listas enlazadas
- Colas de prioridad

---

## Capa de Persistencia (Repository)

Implementada con Spring Data JPA.

Responsabilidades:

- Acceso y persistencia de datos
- Consultas a base de datos
- Mapeo objeto-relacional (ORM)

---

## Base de Datos

Se utiliza H2 Database Engine en modo embebido con persistencia local.

Características:

- Base de datos ligera
- Configuración rápida
- Persistencia mediante archivos `.mv.db`
- Ideal para desarrollo y pruebas académicas

---

# Tecnologías Utilizadas

## Backend

| Tecnología | Versión |
|---|---|
| Java | 25 |
| Spring Boot | 3.2.5 |
| Maven | Última estable |
| Spring Data JPA | Incluido |
| H2 Database | Incluido |

---

## Frontend

| Tecnología | Versión |
|---|---|
| React | Última estable |
| TypeScript | Última estable |
| Vite | Última estable |
| Tailwind CSS | Última estable |
| Axios | Última estable |
| React Router DOM | Última estable |

---

# Estado Actual del Proyecto

Actualmente el sistema cuenta con:

- Persistencia operativa para el módulo de atracciones
- API REST funcional
- Integración con base de datos H2
- Frontend inicializado con React + Vite
- Configuración de Tailwind CSS
- Comunicación frontend/backend mediante proxy de Vite
- Implementación de estructuras de datos personalizadas

---

# Configuración del Entorno

## Requisitos Previos

Instalar previamente:

- Java JDK 25
- Maven
- Node.js 20+
- npm

Verificar instalaciones:

```bash
java -version
mvn -version
node -v
npm -v
```

---

# Ejecución del Backend

## 1. Navegar al directorio del backend

```bash
cd backend/tech-park-uq-back
```

## 2. Ejecutar el servidor Spring Boot

```bash
mvn spring-boot:run
```

Servidor disponible en:

```txt
http://localhost:8080
```

---

# Ejecución del Frontend

## 1. Navegar al directorio del frontend

```bash
cd frontend/tech-park-uq-front
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Ejecutar servidor de desarrollo

```bash
npm run dev
```

Aplicación disponible en:

```txt
http://localhost:5173
```
