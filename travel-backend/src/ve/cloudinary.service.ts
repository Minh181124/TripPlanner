import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryUploadResult {
  file_url: string;
  cloudinary_id: string;
  kieu_file: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    const cloudName = process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    this.logger.log(`Initializing Cloudinary with Cloud Name: ${cloudName}`);
    
    cloudinary.config({
      cloud_name: cloudName,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    userId: number,
  ): Promise<CloudinaryUploadResult> {
    const folder = `ve-nguoidung/${userId}`;
    const resourceType = mimeType === 'application/pdf' ? 'raw' : 'image';

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: resourceType,
            public_id: `${Date.now()}-${originalName.replace(/\.[^.]+$/, '')}`,
            format: resourceType === 'raw' ? 'pdf' : undefined,
          },
          (error, result) => {
            if (error || !result) {
              this.logger.error('Cloudinary upload stream error:', JSON.stringify(error));
              return reject(error || new Error('Upload failed - check Cloudinary credentials'));
            }
            this.logger.log(`File uploaded successfully: ${result.secure_url}`);
            resolve({
              file_url: result.secure_url,
              cloudinary_id: result.public_id,
              kieu_file: mimeType,
            });
          },
        )
        .end(buffer);
    });
  }

  async deleteFile(cloudinaryId: string, mimeType?: string | null): Promise<void> {
    try {
      const resourceType = mimeType === 'application/pdf' ? 'raw' : 'image';
      await cloudinary.uploader.destroy(cloudinaryId, { resource_type: resourceType });
    } catch (error) {
      this.logger.error('Cloudinary delete error:', error);
    }
  }
}
