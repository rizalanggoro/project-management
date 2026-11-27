---
name: pm-tests
description: >-
  Enforces unit test naming conventions and standards for this project's Go
  backend tests (backend/**/*_test.go) and Vitest frontend tests
  (frontend/**/*.test.ts). Use whenever creating, writing, or reviewing tests.
---

# Unit Test Naming Conventions

This skill defines the mandatory test naming convention and standards for this
project: Go tests under `backend/` and Vitest tests under `frontend/`.

---

## 1. Mandatory Test Name Pattern

Every test must strictly follow the three-part convention separated by
underscores:

```text
UnitOfWork_StateUnderTest_ExpectedBehavior
```

| Segment | Purpose | Examples |
| :--- | :--- | :--- |
| **`UnitOfWork`** | Method, handler, or capability being tested | `Create`, `FindByID`, `List`, `toMasterDataFormValues` |
| **`StateUnderTest`** | Input scenario or precondition | `DuplicateCode`, `InvalidID`, `EmptyKeyword`, `NullValues` |
| **`ExpectedBehavior`** | Expected outcome or side effect | `ReturnsError`, `ReturnsExpectedEntity`, `Succeeds`, `FallsBackToDefault` |

For Go, prefix the whole name with `Test` and keep the three parts after it:

```text
Test<Unit>_<State>_<Expected>
```

For table-driven tests or `t.Run` subtests, apply the same pattern to each case
name.

---

## 2. Examples

### Go (`backend/`)

```go
func TestProjectSectionRepository_Find_IdAndCodeProvided_ReturnsAmbiguousError(t *testing.T) {
	// Arrange
	repo := NewRepository()
	id, code := uint(1), "EHS"

	// Act
	_, err := repo.Find(nil, FindOptions{ID: &id, Code: &code})

	// Assert
	if !errors.Is(err, ErrFindAmbiguous) {
		t.Fatalf("expected ErrFindAmbiguous, got %v", err)
	}
}
```

More examples:

- `TestProjectSectionService_Create_DuplicateCode_ReturnsError`
- `TestProjectSectionRepository_List_InvalidSortBy_FallsBackToDefault`
- `TestProjectRepository_Delete_ReferencedProject_ReturnsError`

### Vitest (`frontend/`)

```ts
describe("toMasterDataFormValues", () => {
  it("toMasterDataFormValues_NullValues_ReturnsEmptyFormValues", () => {
    // Arrange
    const input = null

    // Act
    const result = toMasterDataFormValues(input)

    // Assert
    expect(result).toEqual({ code: "", name: "" })
  })
})
```

---

## 3. Best Practices & Rules

1. **Exact structure**: keep the two underscores separating the three parts.
   Do not use formats like `TestCreate()`, `should_return_error_when_duplicate()`,
   or camelCase without separators.
2. **Clear intent**: the name is executable documentation. A failing test name
   must tell what broke, under what condition, and what was expected.
3. **AAA structure**: arrange, act, assert — in that order.
4. **Focused assertions**: one logical outcome per test.
5. **Backend DB tests**: use the dedicated test database, wrap each test in a
   transaction, and roll it back in `t.Cleanup`. Skip (do not fail) when the
   database is unreachable so `go test ./...` stays green elsewhere.
6. **No new dependencies for simple cases**: prefer pure-logic tests (passing
   `nil` for unused dependencies) over adding mocking libraries.
