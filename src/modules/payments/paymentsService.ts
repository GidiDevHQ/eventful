import crypto from "crypto";
import { Prisma } from "@/generated/prisma/client";
import { env } from "@/config/env";
import { AppError } from "@/utils/AppError";
import { initializeTransaction, verifyTransaction } from "./paystackClient";
import { confirmTicketPayment } from "../tickets/ticketsService";
import { prisma } from "@/config/prisma";

export async function initializePayment(userId: string, ticketId: string) {
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { event: true, user: true },
    });

    if (!ticket) throw new AppError("Ticket not found", 404);
    if (ticket.userId !== userId) throw new AppError("This isn't your ticket", 403);
    if (ticket.status !== "PENDING") {
        throw new AppError("This ticket isn't awaiting payment", 400);
    }

    const reference = `evt_${crypto.randomBytes(8).toString("hex")}`;

    const paystackData = await initializeTransaction({
        email: ticket.user.email,
        amountKobo: ticket.event.price,
        reference,
        callbackUrl: `${env.frontendBaseUrl}/payment/callback`,
    });

    await prisma.payment.create({
        data: {
            id: crypto.randomUUID(),
            ticketId: ticket.id,
            paystackRef: reference,
            amount: ticket.event.price,
            status: "PENDING",
        },
    });

    return {
        authorizationUrl: paystackData.authorization_url,
        reference,
    };
}

export async function handlePaystackWebhook(rawBody: Buffer, signature: string) {
    const hash = crypto
    .createHmac("sha512", env.paystackSecretKey)
    .update(rawBody)
    .digest("hex")

    if (hash !== signature) {
        throw new AppError("Invalid webhook signature", 401);
    }

    const event = JSON.parse(rawBody.toString());

    if (event.event === "charge.success") {
        const reference = event.data.reference;

        const verified = await verifyTransaction(reference);

        if (verified.status !== "success") {
            throw new AppError("Payment verification failed", 400);
        }

        const payment = await prisma.payment.findUnique({ where: { paystackRef: reference } });
        if (!payment) throw new AppError("Payment record is not found", 404);

        await prisma.payment.update({
            where: { paystackRef: reference },
            data: { status: "SUCCESS", verifiedAt: new Date() },
        });

        await confirmTicketPayment(payment.ticketId);
    }

    return { received: true };
}

export async function listPaymentForCreator(creatorId: string) {
    return prisma.payment.findMany({
        where: { ticket: { event: { creatorId } } },
        include: {
            ticket: {
                include: {
                    event: { select: { id: true, title: true } },
                    user: { select: { id: true, name: true, email: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" }
    });
}