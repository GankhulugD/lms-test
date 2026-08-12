import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // registerAsync + ConfigService ашиглана: JwtModule.register(...) шиг шууд
    // process.env уншвал .env ачаалагдахаас өмнө (module import-ийн үед) утга
    // тооцоологдож "undefined secret" алдаа гардаг байсан.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        // `ms`-ийн StringValue литерал төрөлтэй нарийн зөрчилдөх тул cast хийв
        signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '15m') as any },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}