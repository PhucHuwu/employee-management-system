import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto): Promise<{ accessToken: string; user: unknown }> {
    return this.authService.login(dto);
  }
}
