import axios from "axios";

describe("GET /api", () => {
  beforeAll(() => {
    axios.defaults.baseURL = "http://localhost:3000";
  });

  it("should return a message", async () => {
    const res = await axios.get("/api");

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: "Hello API" });
  });
});
