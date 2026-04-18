import { describe, test, expect } from "bun:test";
import { app } from "../index";

describe("GET /", () => {
  test("returns 200 with Thrust landing page", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("Thrust");
    expect(html).toContain("Maximum Velocity");
    expect(html).toContain("src/features/");
  });

  test("includes layout shell and stylesheet", async () => {
    const res = await app.request("/");
    const html = await res.text();
    expect(html).toContain("<html");
    expect(html).toContain("style.css");
    expect(html).toContain('data-theme="thrust"');
    expect(html).toContain("typed RPC routes");
  });
});
