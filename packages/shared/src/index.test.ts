import { describe, expect, it } from "vitest";
import * as shared from "./index";

describe("@brume/shared", () => {
  it("loads without error", () => {
    expect(shared).toBeDefined();
  });
});
