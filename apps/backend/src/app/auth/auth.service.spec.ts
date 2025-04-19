import { User } from "@fresh-expense/types";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import type { Model } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";

describe("AuthService", () => {
  let service: AuthService;
  let userModel: Model<User>;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: vi.fn().mockImplementation(() => Promise.resolve("token")),
            verifyAsync: vi.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue("test-secret"),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: vi.fn(),
            create: vi.fn(),
            findById: vi.fn(),
            findByIdAndUpdate: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("should create a new user", async () => {
      const registerDto: RegisterDto = {
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      };

      const mockUser = {
        ...registerDto,
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(userModel, "findOne").mockResolvedValue(null);
      vi.spyOn(userModel, "create").mockResolvedValue(mockUser as unknown);

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: registerDto.email,
      });
      expect(userModel.create).toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should return tokens for valid credentials", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        email: loginDto.email,
        password: "hashedPassword",
        comparePassword: vi.fn().mockResolvedValue(true),
        save: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(userModel, "findOne").mockResolvedValue(mockUser as unknown);

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
});
