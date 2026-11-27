import { describe, expect, it } from "vitest";

import { containsCode, toSelectItems } from "./master-data";

const items = [
  { code: "GA Building", name: "GA Building" },
  { code: "EHS", name: "Environment" },
];

describe("toSelectItems", () => {
  it("maps code and name into select options", () => {
    expect(toSelectItems(items)).toEqual([
      { value: "GA Building", label: "GA Building — GA Building" },
      { value: "EHS", label: "EHS — Environment" },
    ]);
  });

  it("falls back to code when name is empty", () => {
    expect(toSelectItems([{ code: "EHS", name: "" }])).toEqual([
      { value: "EHS", label: "EHS" },
    ]);
  });
});

describe("containsCode", () => {
  it("matches codes case-insensitively", () => {
    expect(containsCode(items, "ehs")).toBe(true);
    expect(containsCode(items, "EHS")).toBe(true);
  });

  it("returns false for unknown codes", () => {
    expect(containsCode(items, "Unknown")).toBe(false);
  });
});
