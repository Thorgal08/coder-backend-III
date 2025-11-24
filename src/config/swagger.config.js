import swaggerJSDoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AdoptMe API',
            version: '1.0.0',
            description: 'API para gestión de adopción de mascotas',
            contact: {
                name: 'API Support',
                email: 'support@adoptme.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Servidor de desarrollo'
            }
        ],
        tags: [
            {
                name: 'Users',
                description: 'Endpoints para gestión de usuarios'
            },
            {
                name: 'Pets',
                description: 'Endpoints para gestión de mascotas'
            },
            {
                name: 'Adoptions',
                description: 'Endpoints para gestión de adopciones'
            },
            {
                name: 'Sessions',
                description: 'Endpoints para autenticación'
            },
            {
                name: 'Mocks',
                description: 'Endpoints para generación de datos de prueba'
            }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID del usuario'
                        },
                        first_name: {
                            type: 'string',
                            description: 'Nombre del usuario'
                        },
                        last_name: {
                            type: 'string',
                            description: 'Apellido del usuario'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email del usuario'
                        },
                        password: {
                            type: 'string',
                            description: 'Contraseña hasheada'
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'admin'],
                            description: 'Rol del usuario'
                        },
                        pets: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    _id: {
                                        type: 'string'
                                    }
                                }
                            },
                            description: 'Mascotas adoptadas por el usuario'
                        }
                    }
                },
                Pet: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID de la mascota'
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre de la mascota'
                        },
                        specie: {
                            type: 'string',
                            description: 'Especie de la mascota'
                        },
                        birthDate: {
                            type: 'string',
                            format: 'date',
                            description: 'Fecha de nacimiento'
                        },
                        adopted: {
                            type: 'boolean',
                            description: 'Estado de adopción'
                        },
                        owner: {
                            type: 'string',
                            description: 'ID del dueño'
                        },
                        image: {
                            type: 'string',
                            description: 'URL de la imagen'
                        }
                    }
                },
                Adoption: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'ID de la adopción'
                        },
                        owner: {
                            type: 'string',
                            description: 'ID del usuario que adopta'
                        },
                        pet: {
                            type: 'string',
                            description: 'ID de la mascota adoptada'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error'
                        },
                        error: {
                            type: 'string',
                            description: 'Mensaje de error'
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'success'
                        },
                        payload: {
                            type: 'object',
                            description: 'Datos de respuesta'
                        }
                    }
                }
            }
        }
    },
    apis: [join(__dirname, '../routes/mocks.router.js')]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
