import { Router } from 'express';
import { generateMockPets, generateMockUsers } from '../utils/mocking.js';
import { petsService, usersService } from '../services/index.js';

const router = Router();

/**
 * @swagger
 * /api/mocks/mockingpets:
 *   get:
 *     summary: Genera 100 mascotas de prueba usando Faker.js
 *     tags: [Mocks]
 *     description: Retorna un array de 100 mascotas generadas aleatoriamente con datos ficticios
 *     responses:
 *       200:
 *         description: Mascotas generadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pet'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/mockingpets', (req, res) => {
    try {
        // genero 100 mascotas de ejemplo
        const pets = generateMockPets(100);
        res.send({ status: 'success', payload: pets });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
});

/**
 * @swagger
 * /api/mocks/mockingusers:
 *   get:
 *     summary: Genera 50 usuarios de prueba usando Faker.js
 *     tags: [Mocks]
 *     description: Retorna un array de 50 usuarios generados aleatoriamente con contraseñas hasheadas
 *     responses:
 *       200:
 *         description: Usuarios generados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/mockingusers', async (req, res) => {
    try {
        // genero 50 usuarios como pide la consigna
        const users = await generateMockUsers(50);
        res.send({ status: 'success', payload: users });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
});

/**
 * @swagger
 * /api/mocks/generateData:
 *   post:
 *     summary: Genera e inserta datos de prueba en la base de datos
 *     tags: [Mocks]
 *     description: Genera la cantidad especificada de usuarios y mascotas e intenta insertarlos en la BD (requiere MongoDB)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - users
 *               - pets
 *             properties:
 *               users:
 *                 type: integer
 *                 description: Cantidad de usuarios a generar
 *                 example: 10
 *               pets:
 *                 type: integer
 *                 description: Cantidad de mascotas a generar
 *                 example: 20
 *     responses:
 *       200:
 *         description: Datos insertados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Se insertaron 10 usuarios y 20 mascotas
 *                 payload:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor (posiblemente MongoDB no conectado)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/generateData', async (req, res) => {
    try {
        const { users, pets } = req.body;

        // validacion de parametros
        if (!users || !pets) {
            return res.status(400).send({
                status: 'error',
                error: 'Se requieren los parametros users y pets'
            });
        }

        // convierto a numero y valido
        const usersCount = parseInt(users);
        const petsCount = parseInt(pets);

        if (isNaN(usersCount) || isNaN(petsCount) || usersCount < 0 || petsCount < 0) {
            return res.status(400).send({
                status: 'error',
                error: 'Los parametros deben ser numeros validos'
            });
        }

        // genero los datos
        const mockUsers = await generateMockUsers(usersCount);
        const mockPets = generateMockPets(petsCount);

        // inserto los usuarios en la BD
        let insertedUsers = [];
        for (let user of mockUsers) {
            const result = await usersService.create(user);
            insertedUsers.push(result);
        }

        // inserto las mascotas en la BD
        let insertedPets = [];
        for (let pet of mockPets) {
            const result = await petsService.create(pet);
            insertedPets.push(result);
        }

        res.send({
            status: 'success',
            message: `Se insertaron ${insertedUsers.length} usuarios y ${insertedPets.length} mascotas`,
            payload: {
                users: insertedUsers,
                pets: insertedPets
            }
        });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
});

export default router;
