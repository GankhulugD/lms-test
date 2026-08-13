import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ErrorCode } from '../../shared/error-codes';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException(ErrorCode.AUTH_EMAIL_TAKEN);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({ ...dto, passwordHash });
    return this.signToken(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException(ErrorCode.AUTH_INVALID_CREDENTIALS);

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException(ErrorCode.AUTH_INVALID_CREDENTIALS);

    return this.signToken(user.id, user.email, user.role);
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException(ErrorCode.AUTH_USER_NOT_FOUND);
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  private signToken(sub: string, email: string, role: string) {
    return { accessToken: this.jwtService.sign({ sub, email, role }) };
  }
}