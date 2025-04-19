const __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        let desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
const __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o.default = v;
      });
const __importStar =
  (this && this.__importStar) ||
  (() => {
    let ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          const ar = [];
          for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod?.__esModule) return mod;
      const result = {};
      if (mod != null)
        for (let k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = __importStar(require("supertest"));
const app_module_1 = require("../src/app/app.module");
const mongoose_1 = require("@nestjs/mongoose");
describe("AuthController (e2e)", () => {
  let app;
  let connection;
  beforeAll(async () => {
    const moduleFixture = await testing_1.Test.createTestingModule({
      imports: [app_module_1.AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new common_1.ValidationPipe());
    await app.init();
    connection = moduleFixture.get((0, mongoose_1.getConnectionToken)());
  });
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    await app.close();
  });
  beforeEach(async () => {
    await connection.dropDatabase();
  });
  const testUser = {
    email: "test@example.com",
    password: "Password123!",
    firstName: "Test",
    lastName: "User",
  };
  describe("/auth/register (POST)", () => {
    it("should register a new user", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("accessToken");
          expect(res.body).toHaveProperty("refreshToken");
          expect(res.body.user).toHaveProperty("email", testUser.email);
          expect(res.body.user).not.toHaveProperty("password");
        });
    });
    it("should fail with invalid data", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "invalid-email",
          password: "123",
        })
        .expect(400);
    });
  });
  describe("/auth/login (POST)", () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post("/auth/register").send(testUser);
    });
    it("should login successfully", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("accessToken");
          expect(res.body).toHaveProperty("refreshToken");
        });
    });
    it("should fail with wrong password", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: "wrongpassword",
        })
        .expect(401);
    });
  });
});
//# sourceMappingURL=auth.e2e-spec.js.map
