import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional(),
});

const parsed = envSchema.parse(process.env);
const port = parsed.PORT ? Number(parsed.PORT) : 3000;

if (!Number.isFinite(port)) {
  throw new Error(`Invalid PORT value: ${parsed.PORT}`);
}

export const env = {
  PORT: port,
};
