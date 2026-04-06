import { z } from "zod";

export const createUserAccountSchema = z.object({
  username: z
    .string()
    .min(3, "Tên đăng nhập tối thiểu 3 ký tự")
    .max(32, "Tên đăng nhập tối đa 32 ký tự")
    .regex(/^[a-zA-Z0-9._-]+$/, "Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch dưới, gạch ngang"),
  password: z
    .string()
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .max(128, "Mật khẩu tối đa 128 ký tự"),
  fullName: z.string().trim().max(120, "Họ tên quá dài").optional().default(""),
  role: z.enum(["manager", "staff"], {
    error: "Vai trò không hợp lệ",
  }),
  storeId: z.string().uuid("Cửa hàng không hợp lệ"),
});

export type CreateUserAccountInput = z.input<typeof createUserAccountSchema>;
export type CreateUserAccountValues = z.output<typeof createUserAccountSchema>;
