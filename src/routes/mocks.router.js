import { Router } from 'express';
import { generateMockPets, generateMockUsers } from '../utils/mocking.js';
import { petsService, usersService } from '../services/index.js';

const router = Router();

// endpoint para generar mascotas mock
router.get('/mockingpets', (req, res) => {
    try {
        // genero 100 mascotas de ejemplo
        const pets = generateMockPets(100);
        res.send({ status: 'success', payload: pets });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
});

// endpoint para generar usuarios mock
router.get('/mockingusers', async (req, res) => {
    try {
        // genero 50 usuarios como pide la consigna
        const users = await generateMockUsers(50);
        res.send({ status: 'success', payload: users });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
});

// endpoint para insertar datos en la BD
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
