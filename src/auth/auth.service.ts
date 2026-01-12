import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import axios from 'axios';
import { User } from '../users/schemas/user.schema';
import { AuthProvider, UserRole } from '../users/schemas/user.schema';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async validateZaloToken(accessToken: string) {
        try {
            const secretKey = this.configService.get<string>('ZALO_APP_SECRET');
            const zaloEnableProof = this.configService.get<string>('ZALO_ENABLE_APPSECRET_PROOF') === 'true';
            // 1. Params chỉ chứa fields và proof (nếu có)
            const params: any = {
                fields: 'id,name,picture',
            };
            // 2. Header chứa access_token
            const headers: any = {
                access_token: accessToken,
            };
            if (zaloEnableProof && secretKey) {
                const appSecretProof = crypto
                    .createHmac('sha256', secretKey) // Check kỹ token và secret không có dấu cách thừa
                    .update(accessToken)
                    .digest('hex');
                headers.appsecret_proof = appSecretProof;
            }
            // 3. Gọi API với headers
            const { data } = await axios.get('https://graph.zalo.me/v2.0/me', {
                headers,
                params,
            });
            if (data.error) {
                console.error('Zalo Error Details:', data.error);
                throw new UnauthorizedException('Invalid Zalo token');
            }
            return data;
        } catch (error) {
            console.error('Axios Error:', error.response?.data || error.message);
            throw new UnauthorizedException('Failed to verify Zalo token');
        }
    }


    async loginWithZalo(accessToken: string) {
        const zaloProfile = await this.validateZaloToken(accessToken);
        const { id: zaloId, name, picture } = zaloProfile;

        let user = await this.usersService.findByZaloId(zaloId);

        if (!user) {
            user = await this.usersService.create({
                fullName: name,
                zaloId,
                avatar: picture?.data?.url,
                authProvider: AuthProvider.ZALO,
                role: UserRole.CUSTOMER,
                isActive: true,
            } as any);
        }

        return this.generateJwt(user);
    }

    generateJwt(user: User) {
        const payload = { sub: user['_id'], zaloId: user.zaloId, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
            user,
        };
    }
}
