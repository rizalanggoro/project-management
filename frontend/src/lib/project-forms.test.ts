import { describe, expect, it } from "vitest";

import {
  buildProgressPayload,
  buildProjectBody,
  masterDataFormSchema,
  toMasterDataFormValues,
} from "./project-forms";

const stages = [
  { key: "progress_ppt" },
  { key: "progress_rab" },
  { key: "progress_bast" },
];

describe("masterDataFormSchema", () => {
  it("accepts and trims valid values", () => {
    expect(
      masterDataFormSchema.parse({ code: "  EHS  ", name: " Environment " })
    ).toEqual({ code: "EHS", name: "Environment" });
  });

  it("rejects empty code and name", () => {
    const result = masterDataFormSchema.safeParse({ code: " ", name: " " });
    expect(result.success).toBe(false);
  });
});

describe("toMasterDataFormValues", () => {
  it("returns empty values for a new record", () => {
    expect(toMasterDataFormValues(null)).toEqual({ code: "", name: "" });
  });

  it("maps an existing record for editing", () => {
    expect(
      toMasterDataFormValues({ code: "EHS", name: "Environment" })
    ).toEqual({ code: "EHS", name: "Environment" });
  });
});

describe("buildProgressPayload", () => {
  it("marks only selected stages as done", () => {
    expect(buildProgressPayload(stages, [{ key: "progress_rab" }])).toEqual({
      progress_ppt: "pending",
      progress_rab: "done",
      progress_bast: "pending",
    });
  });
});

describe("buildProjectBody", () => {
  it("normalizes budget, note and Date plan", () => {
    expect(
      buildProjectBody(
        {
          name: "  Project A  ",
          section: "EHS",
          plant: "Cikarang",
          budget: "Rp 1.500.000",
          note: "  catatan  ",
          planDate: new Date("2026-06-01T00:00:00Z"),
          stages: [{ key: "progress_rab" }],
        },
        stages
      )
    ).toEqual({
      name: "Project A",
      section: "EHS",
      plant: "Cikarang",
      implementation_plan: "2026-06-01",
      budget: "1500000",
      note: "catatan",
      progress_ppt: "pending",
      progress_rab: "done",
      progress_bast: "pending",
    });
  });

  it("keeps a string plan and falls back to zero budget", () => {
    const body = buildProjectBody(
      {
        name: "Project B",
        section: "GA Building",
        plant: "Karawang",
        budget: "",
        note: "",
        planDate: "2026-07-01",
        stages: [],
      },
      stages
    );
    expect(body.budget).toBe("0");
    expect(body.implementation_plan).toBe("2026-07-01");
    expect(body.progress_ppt).toBe("pending");
  });
});
