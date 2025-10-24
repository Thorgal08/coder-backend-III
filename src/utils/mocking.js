import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

// especies disponibles
const species = ['dog', 'cat', 'bird', 'hamster', 'rabbit'];

// generar una mascota con faker
export const generateMockPet = () => {
    return {
        name: faker.person.firstName(),
        specie: faker.helpers.arrayElement(species),
        birthDate: faker.date.past({ years: 10 }),
        adopted: false,
        image: ''
    };
};

// generar un usuario con password encriptada
export const generateMockUser = async () => {
    const hashedPassword = await bcrypt.hash('coder123', 10);
    const role = faker.helpers.arrayElement(['user', 'admin']);

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({
        firstName: firstName.toLowerCase(),
        lastName: lastName.toLowerCase(),
        provider: 'test.com'
    });

    return {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: hashedPassword,
        role: role,
        pets: []
    };
};

// generar N mascotas
export const generateMockPets = (count) => {
    const pets = [];
    for (let i = 0; i < count; i++) {
        pets.push(generateMockPet());
    }
    return pets;
};

// generar N usuarios
export const generateMockUsers = async (count) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        const user = await generateMockUser();
        users.push(user);
    }
    return users;
};
