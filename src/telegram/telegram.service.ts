import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);
    private readonly botToken: string;
    private readonly chatId: string;

    constructor(private configService: ConfigService) {
        this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
        this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
    }

    private escapeHtml(text: string): string {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    async sendBookingNotification(bookingData: any): Promise<void> {
        if (!this.botToken || !this.chatId) {
            this.logger.warn('Telegram Bot Token or Chat ID not configured');
            return;
        }

        const customerName = this.escapeHtml(bookingData.customerName || 'N/A');
        const serviceName = this.escapeHtml(bookingData.serviceName || 'N/A');
        const note = this.escapeHtml(bookingData.note || 'Không có');

        const message = `
<b>🔔 CÓ KHÁCH ĐẶT LỊCH MỚI!</b>
-----------------------------
👤 <b>Khách:</b> ${customerName}
📞 <b>SĐT:</b> ${bookingData.phone || 'N/A'}
📅 <b>Ngày:</b> ${bookingData.date || 'N/A'}
⏰ <b>Giờ:</b> ${bookingData.time || 'N/A'}
💆♀️ <b>Dịch vụ:</b> ${serviceName}
📝 <b>Ghi chú:</b> ${note}
-----------------------------
<i>Vui lòng kiểm tra CMS!</i>
    `;

        try {
            const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

            await axios.post(url, {
                chat_id: this.chatId,
                text: message,
                parse_mode: 'HTML',
            }, {
                timeout: 5000
            });

            this.logger.log('Đã bắn thông báo Telegram thành công');
        } catch (error) {
            this.logger.error(`Lỗi gửi Telegram: ${error.message}`, error.response?.data);
        }
    }
}
