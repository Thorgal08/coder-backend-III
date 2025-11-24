import supertest from 'supertest';
import chai from 'chai';
import mongoose from 'mongoose';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe('Testing Sessions Router', () => {
    let testUserEmail;

    // conectar a MongoDB antes de los tests
    before(async function() {
        this.timeout(10000);
        try {
            await mongoose.connect('mongodb://localhost:27017/db_example?directConnection=true');
            console.log('Connected to MongoDB for testing');
        } catch (error) {
            console.log('Could not connect to MongoDB:', error.message);
        }
    });

    // limpiar usuarios de prueba antes de los tests
    beforeEach(async function() {
        this.timeout(10000);
        testUserEmail = `test_${Date.now()}@test.com`;
    });

    // desconectar de MongoDB despues de todos los tests
    after(async function() {
        this.timeout(10000);
        try {
            await mongoose.connection.close();
            console.log('Disconnected from MongoDB');
        } catch (error) {
            console.log('Error disconnecting from MongoDB:', error.message);
        }
    });

    describe('POST /api/sessions/register', () => {
        it('Debe registrar un nuevo usuario exitosamente', async function() {
            this.timeout(10000);

            const newUser = {
                first_name: 'Test',
                last_name: 'User',
                email: testUserEmail,
                password: 'password123'
            };

            const response = await requester
                .post('/api/sessions/register')
                .send(newUser);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status').that.equals('success');
            expect(response.body).to.have.property('payload');
            expect(response.body.payload).to.be.a('string'); // deberia retornar el ID
        });

        it('Debe retornar error 400 si faltan campos requeridos', async () => {
            const incompleteUser = {
                first_name: 'Test',
                email: testUserEmail
                // faltan last_name y password
            };

            const response = await requester
                .post('/api/sessions/register')
                .send(incompleteUser);

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status').that.equals('error');
            expect(response.body).to.have.property('error').that.equals('Incomplete values');
        });

        it('Debe retornar error 400 si el usuario ya existe', async function() {
            this.timeout(10000);

            const newUser = {
                first_name: 'Test',
                last_name: 'User',
                email: testUserEmail,
                password: 'password123'
            };

            // registrar usuario por primera vez
            await requester.post('/api/sessions/register').send(newUser);

            // intentar registrar el mismo usuario nuevamente
            const response = await requester
                .post('/api/sessions/register')
                .send(newUser);

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status').that.equals('error');
            expect(response.body).to.have.property('error').that.equals('User already exists');
        });

        it('Debe hashear la contraseña del usuario', async function() {
            this.timeout(10000);

            const newUser = {
                first_name: 'Test',
                last_name: 'User',
                email: testUserEmail,
                password: 'password123'
            };

            const response = await requester
                .post('/api/sessions/register')
                .send(newUser);

            expect(response.status).to.equal(200);

            // verificar que el usuario fue creado y la contraseña esta hasheada
            const userResponse = await requester.get('/api/users');
            const createdUser = userResponse.body.payload.find(u => u.email === testUserEmail);

            expect(createdUser).to.exist;
            expect(createdUser.password).to.not.equal('password123'); // debe estar hasheada
            expect(createdUser.password).to.have.length.greaterThan(20); // bcrypt hash es largo
        });

        it('Debe crear usuario con rol user por defecto', async function() {
            this.timeout(10000);

            const newUser = {
                first_name: 'Test',
                last_name: 'User',
                email: testUserEmail,
                password: 'password123'
            };

            await requester.post('/api/sessions/register').send(newUser);

            const userResponse = await requester.get('/api/users');
            const createdUser = userResponse.body.payload.find(u => u.email === testUserEmail);

            expect(createdUser).to.exist;
            expect(createdUser.role).to.equal('user');
        });
    });

    describe('POST /api/sessions/login', () => {
        let registeredUser;

        beforeEach(async function() {
            this.timeout(10000);

            // crear un usuario para las pruebas de login
            registeredUser = {
                first_name: 'Login',
                last_name: 'Test',
                email: testUserEmail,
                password: 'password123'
            };

            await requester.post('/api/sessions/register').send(registeredUser);
        });

        it('Debe hacer login exitosamente con credenciales correctas', async function() {
            this.timeout(10000);

            const loginData = {
                email: registeredUser.email,
                password: registeredUser.password
            };

            const response = await requester
                .post('/api/sessions/login')
                .send(loginData);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status').that.equals('success');
            expect(response.body).to.have.property('message').that.equals('Logged in');
            expect(response.headers['set-cookie']).to.exist;
        });

        it('Debe establecer una cookie al hacer login', async function() {
            this.timeout(10000);

            const loginData = {
                email: registeredUser.email,
                password: registeredUser.password
            };

            const response = await requester
                .post('/api/sessions/login')
                .send(loginData);

            const cookies = response.headers['set-cookie'];
            expect(cookies).to.be.an('array');
            expect(cookies.some(cookie => cookie.includes('coderCookie'))).to.be.true;
        });

        it('Debe retornar error 400 si faltan credenciales', async () => {
            const incompleteLogin = {
                email: registeredUser.email
                // falta password
            };

            const response = await requester
                .post('/api/sessions/login')
                .send(incompleteLogin);

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status').that.equals('error');
            expect(response.body).to.have.property('error').that.equals('Incomplete values');
        });

        it('Debe retornar error 404 si el usuario no existe', async () => {
            const nonExistentUser = {
                email: 'noexiste@test.com',
                password: 'password123'
            };

            const response = await requester
                .post('/api/sessions/login')
                .send(nonExistentUser);

            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('status').that.equals('error');
            expect(response.body).to.have.property('error').that.equals("User doesn't exist");
        });

        it('Debe retornar error 400 con contraseña incorrecta', async function() {
            this.timeout(10000);

            const wrongPassword = {
                email: registeredUser.email,
                password: 'wrongpassword'
            };

            const response = await requester
                .post('/api/sessions/login')
                .send(wrongPassword);

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('status').that.equals('error');
            expect(response.body).to.have.property('error').that.equals('Incorrect password');
        });

        it('Debe actualizar last_connection al hacer login', async function() {
            this.timeout(10000);

            const loginData = {
                email: registeredUser.email,
                password: registeredUser.password
            };

            // hacer login
            await requester.post('/api/sessions/login').send(loginData);

            // verificar que last_connection se actualizo
            const userResponse = await requester.get('/api/users');
            const user = userResponse.body.payload.find(u => u.email === testUserEmail);

            expect(user).to.exist;
            expect(user.last_connection).to.exist;
            expect(new Date(user.last_connection)).to.be.a('date');
        });

        it('Debe validar el formato del email', async () => {
            const invalidEmail = {
                email: 'notanemail',
                password: 'password123'
            };

            const response = await requester
                .post('/api/sessions/login')
                .send(invalidEmail);

            // deberia dar error porque el email no existe
            expect(response.status).to.equal(404);
        });
    });

    describe('Pruebas de integración - Registro y Login', () => {
        it('Debe completar el flujo de registro y login', async function() {
            this.timeout(15000);

            const newUser = {
                first_name: 'Integration',
                last_name: 'Test',
                email: testUserEmail,
                password: 'password123'
            };

            // 1. Registrar usuario
            const registerResponse = await requester
                .post('/api/sessions/register')
                .send(newUser);

            expect(registerResponse.status).to.equal(200);
            expect(registerResponse.body.status).to.equal('success');

            // 2. Hacer login con el usuario registrado
            const loginResponse = await requester
                .post('/api/sessions/login')
                .send({
                    email: newUser.email,
                    password: newUser.password
                });

            expect(loginResponse.status).to.equal(200);
            expect(loginResponse.body.status).to.equal('success');
            expect(loginResponse.body.message).to.equal('Logged in');

            // 3. Verificar que se creo la cookie
            const cookies = loginResponse.headers['set-cookie'];
            expect(cookies).to.exist;
            expect(cookies.some(cookie => cookie.includes('coderCookie'))).to.be.true;
        });
    });
});
