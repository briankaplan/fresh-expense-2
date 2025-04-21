import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { Response } from "supertest";

import { closeTestApp, createTestApp } from "./setup";
import { AppModule } from "../src/app.module";

describe("MetricsController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe("/metrics (POST)", () => {
    it("should create a new metric", () => {
      return request(app.getHttpServer())
        .post("/metrics")
        .send({
          type: "TRANSACTION",
          value: 100,
          metadata: { userId: "user1" },
        })
        .expect(201)
        .expect((res: Response) => {
          expect(res.body).toHaveProperty("_id");
          expect(res.body.type).toBe("TRANSACTION");
          expect(res.body.value).toBe(100);
          expect(res.body.metadata.userId).toBe("user1");
        });
    });
  });

  describe("/metrics (GET)", () => {
    it("should return all metrics", () => {
      return request(app.getHttpServer())
        .get("/metrics")
        .expect(200)
        .expect((res: Response) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe("/metrics/:id (GET)", () => {
    it("should return a specific metric", async () => {
      // First create a metric
      const createResponse = await request(app.getHttpServer())
        .post("/metrics")
        .send({
          type: "TRANSACTION",
          value: 100,
          metadata: { userId: "user1" },
        });

      const metricId = createResponse.body._id;

      return request(app.getHttpServer())
        .get(`/metrics/${metricId}`)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body._id).toBe(metricId);
          expect(res.body.type).toBe("TRANSACTION");
          expect(res.body.value).toBe(100);
        });
    });
  });

  describe("/metrics/:id (PUT)", () => {
    it("should update a metric", async () => {
      // First create a metric
      const createResponse = await request(app.getHttpServer())
        .post("/metrics")
        .send({
          type: "TRANSACTION",
          value: 100,
          metadata: { userId: "user1" },
        });

      const metricId = createResponse.body._id;

      return request(app.getHttpServer())
        .put(`/metrics/${metricId}`)
        .send({ value: 200 })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body._id).toBe(metricId);
          expect(res.body.value).toBe(200);
        });
    });
  });

  describe("/metrics/:id (DELETE)", () => {
    it("should delete a metric", async () => {
      // First create a metric
      const createResponse = await request(app.getHttpServer())
        .post("/metrics")
        .send({
          type: "TRANSACTION",
          value: 100,
          metadata: { userId: "user1" },
        });

      const metricId = createResponse.body._id;

      return request(app.getHttpServer())
        .delete(`/metrics/${metricId}`)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body._id).toBe(metricId);
        });
    });
  });
});
