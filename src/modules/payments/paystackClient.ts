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
    
}