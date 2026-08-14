import QRCode from "qrcode";
import { randomBytes } from "crypto";

export function generateTicketToken(): string {
    return randomBytes(16).toString("hex");
}

export async function generateQrCodeDataUrl(token: string): Promise<string> {
    return QRCode.toDataURL(token);
}