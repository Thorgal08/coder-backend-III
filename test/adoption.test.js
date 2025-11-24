import supertest from 'supertest';
import chai from 'chai';
import mongoose from 'mongoose';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe('Testing Adoptions Router', () => {
    let testUser;
    let testPet;
    let adoptionId;

    // Conectar a MongoDB antes de los tests
    before(async function() {
        this.timeout(10000);
        try {
            await mongoose.connect('mongodb://localhost:27017/db_example?directConnection=true');
            console.log('Connected to MongoDB for testing');
        } catch (error) {
            console.log('Could not connect to MongoDB:', error.message);
        }
    });

    // Limpiar datos de prueba antes de cada test
    beforeEach(async function() {
        this.timeout(10000);

        // Crear un usuario de prueba
        const userResponse = await requester.post('/api/mocks/generateData').send({
            users: 1,
            pets: 0
        });

        if (userResponse.body.status === 'success' && userResponse.body.payload.users.length > 0) {
            testUser = userResponse.body.payload.users[0];
        }

        // Crear una mascota de prueba
        const petResponse = await requester.post('/api/mocks/generateData').send({
            users: 0,
            pets: 1
        });

        if (petResponse.body.status === 'success' && petResponse.body.payload.pets.length > 0) {
            testPet = petResponse.body.payload.pets[0];
        }
    });

    // Desconectar de MongoDB después de todos los tests
    after(async function() {
        this.timeout(10000);
        try {
            await mongoose.connection.close();
            console.log('Disconnected from MongoDB');
        } catch (error) {
            console.log('Error disconnecting from MongoDB:', error.message);
        }
    });

    describe('GET /api/adoptions', () => {
        it('Debe obtener todas las adopciones', async () => {
            const response = await requester.get('/api/adoptions');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status').that.equals('success');
            expect(response.body).to.have.property('payload').that.is.an('array');
        });

        it('Debe retornar un array vacío si no hay adopciones', async () => {
            // Limpiar todas las adopciones primero
            const adoptionsCollection = mongoose.connection.collection('adoptions');
            await adoptionsCollection.deleteMany({});

            const response = await requester.get('/api/adoptions');

            expect(response.status).to.equal(200);
            expect(response.body.payload).to.be.an('array').that.is.empty;
        });
    });

    describe('GET /api/adoptions/:aid', () => {
        it('Debe obtener una adopción por ID', async function() {
            this.timeout(10000);

            // Primero crear una adopción
            if (testUser && testPet) {
                const createResponse = await requester
                    .post(`/api/adoptions/${testUser._id}/${testPet._id}`);

                if (createResponse.status === 200) {
                    // Obtener la adopción recién creada
                    const adoptions = await requester.get('/api/adoptions');

                    if (adoptions.body.payload.length > 0) {
                        adoptionId = adoptions.body.payload[0]._id;

                        const response = await requester.get(`/api/adoptions/${adoptionId}`);

                        expect(response.status).to.equal(200);
                        expect(response.body).to.have.property('status').that.equals('success');
                        expect(response.body).to.have.property('payload').that.is.an('object');
                        expect(response.body.payload).to.have.property('_id');
                    }
                }
            }
        });

        it('Debe retornar error 404 si la adopción no existe', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const response = await requester.get(`/api/adoptions/${fakeId}`);

            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('status').that.equals('error');
            expect(response.body).to.have.property('error').that.equals('Adoption not found');
        });

        it('Debe retornar error si el ID no es válido', async () => {
            const response = await requester.get('/api/adoptions/invalid-id');

            expect(response.status).to.be.oneOf([400, 404, 500]);
            expect(response.body).to.have.property('status').that.equals('error');
        });
    });

    describe('POST /api/adoptions/:uid/:pid', () => {
        it('Debe crear una adopción exitosamente', async function() {
            this.timeout(10000);

            if (!testUser || !testPet) {
                this.skip();
                return;
            }

            const response = await requester
                .post(`/api/adoptions/${testUser._id}/${testPet._id}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status').that.equals('success');
            expect(response.body).to.have.property('message').that.equals('Pet adopted');
        });

        it('Debe retornar error 404 si el usuario no existe', async function() {
            this.timeout(10000);

            if (!testPet) {
                this.skip();
                return;
            }

            const fakeUserId = new mongoose.Types.ObjectId();
            const response = await requester
                .post(`/api/adoptions/${fakeUserId}/${testPet._id}`);

            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('status').that.equals('error');
            expect(response.body).to.have.property('error').that.equals('user Not found');
        });

        it('Debe retornar error 404 si la mascota no existe', async function() {
            this.timeout(10000);

            if (!testUser) {
                this.skip();
                return;
            }

            const fakePetId = new mongoose.Types.ObjectId();
            const response = await requester
                .post(`/api/adoptions/${testUser._id}/${fakePetId}`);

            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('status').that.equals('error');
            expect(response.body).to.have.property('error').that.equals('Pet not found');
        });

        it('Debe retornar error 400 si la mascota ya está adoptada', async function() {
            this.timeout(10000);

            if (!testUser || !testPet) {
                this.skip();
                return;
            }

            // Adoptar la mascota por primera vez
            await requester.post(`/api/adoptions/${testUser._id}/${testPet._id}`);

            // Intentar adoptarla nuevamente
            const response = await requester
                .post(`/api/adoptions/${testUser._id}/${testPet._id}`);

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status').that.equals('error');
            expect(response.body).to.have.property('error').that.equals('Pet is already adopted');
        });

        it('Debe actualizar el usuario con la mascota adoptada', async function() {
            this.timeout(10000);

            if (!testUser || !testPet) {
                this.skip();
                return;
            }

            // Crear la adopción
            await requester.post(`/api/adoptions/${testUser._id}/${testPet._id}`);

            // Verificar que el usuario tiene la mascota
            const userResponse = await requester.get(`/api/users/${testUser._id}`);

            expect(userResponse.status).to.equal(200);
            expect(userResponse.body.payload).to.have.property('pets').that.is.an('array');
            expect(userResponse.body.payload.pets.length).to.be.greaterThan(0);
        });

        it('Debe marcar la mascota como adoptada', async function() {
            this.timeout(10000);

            if (!testUser || !testPet) {
                this.skip();
                return;
            }

            // Crear la adopción
            await requester.post(`/api/adoptions/${testUser._id}/${testPet._id}`);

            // Verificar que la mascota está adoptada
            const petResponse = await requester.get(`/api/pets/${testPet._id}`);

            expect(petResponse.status).to.equal(200);
            expect(petResponse.body.payload).to.have.property('adopted').that.equals(true);
            expect(petResponse.body.payload).to.have.property('owner');
        });

        it('Debe retornar error si los IDs no son válidos', async () => {
            const response = await requester
                .post('/api/adoptions/invalid-uid/invalid-pid');

            expect(response.status).to.be.oneOf([400, 404, 500]);
            expect(response.body).to.have.property('status').that.equals('error');
        });
    });

    describe('Pruebas de integración completas', () => {
        it('Debe completar el flujo completo de adopción', async function() {
            this.timeout(15000);

            if (!testUser || !testPet) {
                this.skip();
                return;
            }

            // 1. Verificar que la mascota no está adoptada
            let petResponse = await requester.get(`/api/pets/${testPet._id}`);
            expect(petResponse.body.payload.adopted).to.equal(false);

            // 2. Crear la adopción
            const adoptResponse = await requester
                .post(`/api/adoptions/${testUser._id}/${testPet._id}`);
            expect(adoptResponse.status).to.equal(200);

            // 3. Verificar que la mascota ahora está adoptada
            petResponse = await requester.get(`/api/pets/${testPet._id}`);
            expect(petResponse.body.payload.adopted).to.equal(true);

            // 4. Verificar que el usuario tiene la mascota
            const userResponse = await requester.get(`/api/users/${testUser._id}`);
            expect(userResponse.body.payload.pets.length).to.be.greaterThan(0);

            // 5. Verificar que la adopción existe en la lista
            const adoptionsResponse = await requester.get('/api/adoptions');
            const adoptionExists = adoptionsResponse.body.payload.some(
                adoption => adoption.owner === testUser._id && adoption.pet === testPet._id
            );
            expect(adoptionExists).to.be.true;
        });
    });
});
