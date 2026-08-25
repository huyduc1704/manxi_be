import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('zalo-login')
    async zaloLogin(@Body('accessToken') accessToken: string) {
        if (!accessToken) {
            throw new UnauthorizedException('Access token is required');
        }
        return this.authService.loginWithZalo(accessToken);
    }

    @Post('zalo-login-web')
    async zaloLoginWeb(@Body('code') code: string) {
        if (!code) {
            throw new UnauthorizedException('Authorization Code is required');
        }
        return this.authService.loginWithZaloCode(code);
    }
}
