import { z } from "zod";

export function integerFormValueSchema(message = "Zadejte celé číslo.") {
  return z
    .string()
    .trim()
    .regex(/^\d+$/, message)
    .transform((value) => Number(value));
}
