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

export const uploadBase64 = async (image: string): Promise<UploadApiResponse> => {
    try {
        const result = await cloudinary.uploader.upload(image, {
            folder: "products",
        });

        return result;

    } catch (error: any) {
        console.error("Cloudinary upload failed:", error);

        throw new Error(error.message || "Cloudinary upload failed");
    }
};

export const deleteFile = async (publicId: string) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(result)
        return result;
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw error;
    }
};

export const deleteFiles = async (publicIds: string[]) => {
    if (!publicIds.length) return;

    try {
        const result = await cloudinary.api.delete_resources(publicIds);
        return result;
    } catch (error) {
        console.error("Bulk delete failed:", error);
        throw error;
    }
};