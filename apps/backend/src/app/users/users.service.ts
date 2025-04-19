import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '@fresh-expense/types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findById(id: string, includePassword = false): Promise<UserDocument> {
    const query = this.userModel.findById(id);
    if (includePassword) {
      query.select('+password');
    }
    const user = await query.exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string, includePassword = false): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateUserDto, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(userId: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(userId).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.refreshTokens = [...(user.refreshTokens || []), token];
    await user.save();

    return token;
  }
}
