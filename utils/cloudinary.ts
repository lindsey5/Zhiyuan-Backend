import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinaryConfig';

export const uploadFile = (
    fileBuffer: Buffer, 
    folder: string = 'products'
) :  Promise<UploadApiResponse> => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader
            .upload_stream(
                { folder },
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error) return reject(error);
                if (!result) return reject(new Error("Upload failed"));

                resolve(result);
                }
            )
        .end(fileBuffer);
    });
};

export const deleteImage = async (publicId: string) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw error;
    }
};