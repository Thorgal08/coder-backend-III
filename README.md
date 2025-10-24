# Proyecto AdoptMe - Backend III

API para gestión de adopción de mascotas.

## Entrega 1 - Endpoints de Mocking

### Instalación

```bash
npm install
npm start
```

### Endpoints nuevos

**GET /api/mocks/mockingpets**
Genera 100 mascotas de prueba

**GET /api/mocks/mockingusers**
Genera 50 usuarios de prueba con:
- Password "coder123" encriptada
- Role aleatorio (user/admin)
- Array pets vacío

**POST /api/mocks/generateData**
Inserta usuarios y mascotas en la BD
```json
{
  "users": 5,
  "pets": 10
}
```

### Verificar datos insertados
```bash
GET /api/users
GET /api/pets
```

## Tecnologías
- Express
- Mongoose
- Faker.js (para datos mock)
- bcrypt
