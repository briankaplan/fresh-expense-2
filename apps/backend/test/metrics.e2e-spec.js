const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const setup_1 = require("./setup");
describe("MetricsController (e2e)", () => {
  let app;
  beforeAll(async () => {
    app = await (0, setup_1.createTestApp)();
  });
  afterAll(async () => {
    await (0, setup_1.closeTestApp)(app);
  });
  describe("/metrics (POST)", () => {
    it("should create a new metric", () => {
      return (0, supertest_1.default)(app.getHttpServer())
        .post("/metrics")
        .send({
          type: "TRANSACTION",
          value: 100,
          metadata: { userId: "user1" },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("_id");
          expect(res.body.type).toBe("TRANSACTION");
          expect(res.body.value).toBe(100);
          expect(res.body.metadata.userId).toBe("user1");
        });
    });
  });
  describe("/metrics (GET)", () => {
    it("should return all metrics", () => {
      return (0, supertest_1.default)(app.getHttpServer())
        .get("/metrics")
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
  describe("/metrics/:id (GET)", () => {
    it("should return a specific metric", async () => {
      // First create a metric
      const createResponse = await (0, supertest_1.default)(app.getHttpServer())
        .post("/metrics")
        .send({
          type: "TRANSACTION",
          value: 100,
          metadata: { userId: "user1" },
        });
      const metricId = createResponse.body._id;
      return (0, supertest_1.default)(app.getHttpServer())
        .get(`/metrics/${metricId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(metricId);
          expect(res.body.type).toBe("TRANSACTION");
          expect(res.body.value).toBe(100);
        });
    });
  });
  describe("/metrics/:id (PUT)", () => {
    it("should update a metric", async () => {
      // First create a metric
      const createResponse = await (0, supertest_1.default)(app.getHttpServer())
        .post("/metrics")
        .send({
          type: "TRANSACTION",
          value: 100,
          metadata: { userId: "user1" },
        });
      const metricId = createResponse.body._id;
      return (0, supertest_1.default)(app.getHttpServer())
        .put(`/metrics/${metricId}`)
        .send({ value: 200 })
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(metricId);
          expect(res.body.value).toBe(200);
        });
    });
  });
  describe("/metrics/:id (DELETE)", () => {
    it("should delete a metric", async () => {
      // First create a metric
      const createResponse = await (0, supertest_1.default)(app.getHttpServer())
        .post("/metrics")
        .send({
          type: "TRANSACTION",
          value: 100,
          metadata: { userId: "user1" },
        });
      const metricId = createResponse.body._id;
      return (0, supertest_1.default)(app.getHttpServer())
        .delete(`/metrics/${metricId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(metricId);
        });
    });
  });
});
//# sourceMappingURL=metrics.e2e-spec.js.map
