import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsString,
  Min,
  validateSync,
} from "class-validator";

enum NodeEnv {
  development = "development",
  production = "production",
  test = "test",
}

class EnvVars {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.development;

  @IsInt()
  @Min(1)
  PORT = 3001;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  WEB_ORIGIN = "http://localhost:5173";

  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_ACCESS_TTL = "15m";

  @IsString()
  JWT_REFRESH_TTL = "7d";
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvVars, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.map((e) => Object.values(e.constraints ?? {}).join(", ")).join("; "));
  }
  return validated;
}

export type AppEnv = EnvVars;
