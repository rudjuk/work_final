import { UserModel } from '../models/user.model';
import { User, CreateUserDto, UpdateUserDto, UserResponse } from '../types/user.types';

export class UserService {
  constructor(private userModel: UserModel) {}

  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createUser(data: CreateUserDto): Promise<UserResponse> {
    const user = await this.userModel.create(data);
    return this.toUserResponse(user);
  }

  async getUsers(): Promise<UserResponse[]> {
    const users = await this.userModel.findAll();
    return users.map((user) => this.toUserResponse(user));
  }

  async getUserById(id: number): Promise<UserResponse | null> {
    const user = await this.userModel.findById(id);
    return user ? this.toUserResponse(user) : null;
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<UserResponse | null> {
    const user = await this.userModel.findById(id);
    if (!user) {
      return null;
    }
    const updated = await this.userModel.update(id, data);
    return updated ? this.toUserResponse(updated) : null;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.userModel.delete(id);
  }
}

