import { UserRepository } from '../repositories/userRepository';
import { NewUser } from '../types/userTypes';
import { hashPassword } from '../utils/hash';
import { UserAlreadyExists } from '../middlewares/errorMiddleware';

export class UserService {

    static async createUser(user: NewUser) {
        const exists = await UserRepository.findUserByEmail(user.email);
        if (exists) {
            throw new UserAlreadyExists();
        }

        const hashedPassword = await hashPassword(user.password);

        return await UserRepository.createUser({
            ...user,
            password: hashedPassword,
        });
    }

    static async getAllUsers() {
        return UserRepository.findAllUsers();
    }

    static async getUserById(id: string) {
        return UserRepository.findUserById(id);
    }

    static async getUserByEmail(email: string) {
        return UserRepository.findUserByEmail(email);
    }

    static async updateUser(id: string, user: Partial<NewUser>) {
        if (user.password) {
            user.password = await hashPassword(user.password);
        }
        return UserRepository.updateUser(id, user);
    }

    static async deleteUserByEmail(email: string) {
        return UserRepository.deleteUserByEmail(email);
    }

    static async deleteUserById(id: string) {
        return UserRepository.deleteUser(id);
    }

}
