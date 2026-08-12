import { Request, Response } from "express";
import { catchAsync } from "@/utils/AppError";
import * as authService from "./authService";
import { date, success } from "zod";

export const signup = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.signup(req.body)
    res.status(201).json({ status: "success", data: result })
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json({ status: "success", data: result });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
    const token = req.body.refreshToken || req.headers["x-refresh-token"];

    if (!token || typeof token !== "string") {
        res.status(400).json({
            success: false,
            message: "Refresh token is required",
        });
        return;
    }

    const tokens = await authService.refresh(token);

    res.status(200).json({
        success: true,
        message: "Tokens rotated successfully",
        data: tokens
    });
});