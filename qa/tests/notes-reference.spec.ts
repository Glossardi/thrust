import { expect, test } from "@playwright/test";

test("notes reference feature works end to end", async ({ page }) => {
  await page.goto("/notes");

  await expect(page.getByRole("heading", { name: "Notes reference" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Create note" })).toBeVisible();

  await page.getByLabel("Title").fill("Ship the reference feature");
  await page.getByLabel("Content").fill("Prove the RPC plus islands architecture in a real browser.");
  await page.getByLabel("Category").selectOption("work");

  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/notes/api") && response.request().method() === "POST"),
    page.getByRole("button", { name: "Create note" }).click(),
  ]);

  const noteCard = page.locator("article").filter({
    has: page.getByRole("heading", { name: "Ship the reference feature" }),
  });

  await expect(page.getByRole("heading", { name: "Ship the reference feature" })).toBeVisible();
  await expect(noteCard.getByText("work")).toBeVisible();

  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/notes/api/") && response.request().method() === "PATCH"),
    page.getByRole("button", { name: "Pin Ship the reference feature" }).click(),
  ]);

  await expect(noteCard.getByText("Pinned")).toBeVisible();

  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/notes/api/filter") && response.request().method() === "GET"),
    page.getByLabel("Filter notes").selectOption("personal"),
  ]);

  await expect(page.getByText("No notes yet. Create your first one!")).toBeVisible();

  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/notes/api/filter") && response.request().method() === "GET"),
    page.getByLabel("Filter notes").selectOption("work"),
  ]);

  await expect(page.getByRole("heading", { name: "Ship the reference feature" })).toBeVisible();

  await Promise.all([
    page.waitForResponse((response) => response.url().includes("/notes/api/") && response.request().method() === "DELETE"),
    page.getByRole("button", { name: "Delete Ship the reference feature" }).click(),
  ]);

  await expect(page.getByText("No notes yet. Create your first one!")).toBeVisible();
});
