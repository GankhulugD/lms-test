import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  findByEmails(emails: string[]) {
    return this.userModel
      .find({ email: { $in: emails.map((e) => e.toLowerCase()) } })
      .exec();
  }

  async create(data: CreateUserInput): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }
}
