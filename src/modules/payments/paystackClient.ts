import axios from "axios";
import { env } from "@/config/env";

const paystackApi = axios.create({
    baseURL: env.paystackBaseUrl,
    headers: {
        Authorization: `Bearer ${env.paystackSecretKey}`,
        "Content-type": "application/json",
    },
});

interface InitializeTransactionResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export async function initializeTransaction(params: {
    email: string;
    amountKobo: number;
    reference: string;
    callbackUrl: string
}) {
    const response = await paystackApi.post<InitializeTransactionResponse>(
        "/transaction/initialize",
        {
            email: params.email,
            amount: params.amountKobo,
            reference: params.reference,
            callback_url: params.callbackUrl
        }
    );

    return response.data.data
}

interface verifyTransactionResponse{
    status: boolean;
    message: string;
    data: {
        status: "success" | "failed" | "abandoned";
        reference: string;
        amount: number;
    };
}

export async function verifyTransaction(reference: string) {
   const response = await paystackApi.get<verifyTransactionResponse>(
    `/transaction/verify/${reference}`
   );

   return response.data.data
}