import QRCode from "qrcode";
import { randomBytes } from "crypto";

// Generate a unique opaque ticket token that is embedded in a QR code and later used to verify attendance.
export function generateTicketToken(): string {
    return randomBytes(16).toString("hex");
}

// Turn the ticket token into a QR image payload so it can be displayed and scanned by the event creator.
export async function generateQrCodeDataUrl(token: string): Promise<string> {
    return QRCode.toDataURL(token);
}