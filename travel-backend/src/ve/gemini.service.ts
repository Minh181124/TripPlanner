import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      this.logger.error('❌ GEMINI_API_KEY is MISSING in process.env!');
    } else {
      this.logger.log(`✅ GeminiService initialized with API Key: ${apiKey.substring(0, 6)}...`);
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  async extractTicketInfo(input: {
    text?: string;
    buffer?: Buffer;
    mimeType?: string;
  }): Promise<any> {
    this.logger.log(`[GeminiService] extractTicketInfo called. Input: ${input.text ? 'Text' : 'File'}`);
    if (!this.model) {
      throw new HttpException(
        'Tính năng AI chưa được cấu hình (Thiếu API Key). Vui lòng liên hệ Admin.',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    try {
      const prompt = `
Bạn là một trợ lý AI chuyên môn cao trong việc trích xuất dữ liệu từ các loại vé (vé máy bay, vé xe khách, vé tàu).
Nhiệm vụ của bạn là đọc nội dung văn bản hoặc hình ảnh/văn bản từ file PDF được cung cấp, sau đó tìm và trích xuất các thông tin quan trọng của chuyến đi.
Nếu trong ảnh có mã QR, hãy cố gắng đọc nội dung bên trong nó (nếu có thể nhìn thấy text đi kèm).

LƯU Ý QUAN TRỌNG:
1. Bạn BẮT BUỘC phải trả về một JSON hợp lệ. Không được kèm theo bất kỳ văn bản giải thích nào, ví dụ như "Đây là kết quả của bạn". Bắt đầu trực tiếp bằng ký tự '{' và kết thúc bằng '}'.
2. Hãy đánh giá độ tự tin (confidence_score) theo thang điểm từ 0 đến 100. Đánh giá dựa trên độ rõ ràng của thông tin bạn tìm thấy.

Định dạng JSON cần trả về:
{
  "tieu_de": "Chuỗi tóm tắt, ví dụ: Vé xe Phương Trang, Vé bay Vietjet",
  "loai_ve": "Một trong các danh mục: bus, flight, train, event, other",
  "ngay_su_dung": "Định dạng YYYY-MM-DD, nếu có giờ thì YYYY-MM-DDTHH:mm:00. Nếu không thấy, trả về null",
  "nha_cung_cap": "Tên nhà xe, hãng hàng không (VD: Phương Trang, Vietjet, Vexere...)",
  "ghi_chu": "Trường cực kỳ quan trọng: Nếu phát hiện các thông tin như Mã đặt chỗ (Booking code / PNR), Mã vé số vé, Cổng đón/Quầy thủ tục (Gate/Platform/Terminal), Trạng thái thanh toán (Đã thanh toán/Chưa) hoặc ghi chú riêng, hãy tóm tắt và list tất cả vào trường này.",
  "chi_tiet": {
    "tuyen_duong": "Nơi đi - Nơi đến (VD: Sài Gòn - Đà Lạt)",
    "gio_khoi_hanh": "Giờ khởi hành (VD: 22:30)",
    "thoi_gian_den": "Giờ dự kiến đến (VD: 05:00)",
    "so_ghe": "Số ghế / số giường / hạng vé (VD: A12, Giường tầng 1)",
    "gia_tien": "Giá vé/tổng tiền (VD: 500.000đ, 2.000.000 VNĐ) nếu có"
  },
  "confidence_score": 85,
  "confidence_reason": "Giải thích ngắn gọn tại sao bạn lại cho điểm này"
}
`;

      let result;

      if (input.buffer && input.mimeType) {
        // AI Xử lý file (Ảnh hoặc PDF)
        const filePart = {
          inlineData: {
            data: input.buffer.toString('base64'),
            mimeType: input.mimeType,
          },
        };
        result = await this.model.generateContent({
          contents: [{ role: 'user', parts: [filePart, { text: prompt }] }],
        });
      } else if (input.text) {
        // AI Xử lý text
        result = await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt + '\n\nSau đây là nội dung cần trích xuất:\n' + input.text }] }],
        });
      } else {
        throw new HttpException('Không có dữ liệu đầu vào cho AI', HttpStatus.BAD_REQUEST);
      }

      this.logger.log('Sending request to Gemini...');
      const responseText = result.response.text();
      this.logger.log('AI Response received.');
      
      try {
        // Clean markdown JSON wrapper if present
        let cleanText = responseText.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
        }

        const jsonParse = JSON.parse(cleanText);
        return jsonParse;
      } catch (parseError) {
        this.logger.error('❌ JSON Parse Error. Raw Response:', responseText);
        throw new HttpException(
          'Kết quả từ AI không đúng định dạng JSON. Vui lòng thử lại.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      this.logger.error('❌ Gemini API Error:', error);
      const status = (error as any).status || (error as any).response?.status;
      if (status === 403 || status === 401) {
        throw new HttpException('API Key Gemini không hợp lệ hoặc đã hết hạn.', HttpStatus.UNAUTHORIZED);
      }
      if (status === 404) {
        throw new HttpException('Model AI không tìm thấy hoặc vùng của bạn chưa được hỗ trợ (404). Hãy kiểm tra API Key.', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Lỗi AI: ' + (error as any).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
