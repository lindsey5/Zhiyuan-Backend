import SibApiV3Sdk from 'sib-api-v3-sdk';

const brevoClient = SibApiV3Sdk.ApiClient.instance;
brevoClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY as string;

export const brevo = new SibApiV3Sdk.TransactionalEmailsApi();

// Shared sender info
export const sender = {
    name: 'Zhiyuan Enterprice Inc.',
    email: process.env.EMAIL_USER as string,
};