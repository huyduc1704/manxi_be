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
    async getAccessTokenFromCode(code: string) {
        try {
            const appId = this.configService.get<string>('ZALO_APP_ID');
            const secretKey = this.configService.get<string>('ZALO_APP_SECRET');

            // Theo tài liệu Zalo: https://oauth.zalo.me/v4/access_token
            const body = new URLSearchParams({
                app_id: appId || '',
                code: code,
                grant_type: 'authorization_code',
                code_verifier: 'your_code_verifier_if_using_pkce' // Nếu không dùng PKCE thì có thể bỏ hoặc để trống
            });

            // Note: Zalo yêu cầu content-type là application/x-www-form-urlencoded, và secret key ở header
            const { data } = await axios.post('https://oauth.zalo.me/v4/access_token', body, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'secret_key': secretKey
                }
            });

            if (data.error) {
                console.error('=== ZALO LOGIN ERROR ===');
                console.error('Error Name:', data.error_name);
                console.error('Error Description:', data.error_description);
                console.error('Error Reason:', data.error_reason);
                console.error('Response Data:', JSON.stringify(data, null, 2));
                throw new UnauthorizedException(`Zalo Token Exchange Failed: ${data.error_name} - ${data.error_reason || data.error_description}`);
            }

            return data.access_token;
        } catch (error) {
            console.error('=== INTERNAL LOGIN ERROR ===');
            console.error(error.response?.data || error.message);
            throw new UnauthorizedException(`Could not get Zalo Access Token from Code. Details: ${error.message}`);
        }
    }

    async loginWithZaloCode(code: string) {
        // 1. Đổi Code lấy Access Token
        const accessToken = await this.getAccessTokenFromCode(code);

        // 2. Dùng Access Token để login như bình thường
        return this.loginWithZalo(accessToken);
    }
}
