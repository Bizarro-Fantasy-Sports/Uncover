import { normalize } from "./strings";

describe("normalize", () => {
  it("should convert string to lowercase", () => {
    expect(normalize("HELLO")).toBe("hello");
    expect(normalize("HeLLo WoRLd")).toBe("helloworld");
  });

  it("should remove whitespace", () => {
    expect(normalize("hello world")).toBe("helloworld");
    expect(normalize("  hello  world  ")).toBe("helloworld");
    expect(normalize("hello\tworld")).toBe("helloworld");
    expect(normalize("hello\nworld")).toBe("helloworld");
  });

  it("should remove apostrophes", () => {
    expect(normalize("O'Brien")).toBe("obrien");
    expect(normalize("it's")).toBe("its");
    expect(normalize("'quoted'")).toBe("quoted");
  });

  it("should remove hyphens", () => {
    expect(normalize("Jean-Claude")).toBe("jeanclaude");
    expect(normalize("double-barreled-name")).toBe("doublebarreledname");
  });

  it("should remove periods", () => {
    expect(normalize("Ken Griffey Jr.")).toBe("kengriffeyjr");
    expect(normalize("A.J. Brown Sr.")).toBe("ajbrownsr");
  });

  it("should handle combined transformations", () => {
    expect(normalize("Shaquille O'Neal")).toBe("shaquilleoneal");
    expect(normalize("Mary-Kate Olsen")).toBe("marykateolsen");
    expect(normalize("D'Angelo Russell")).toBe("dangelorussell");
    expect(normalize("Karl-Anthony Towns")).toBe("karlanthonytowns");
  });

  it("should handle empty string", () => {
    expect(normalize("")).toBe("");
  });

  it("should handle undefined input", () => {
    expect(normalize(undefined)).toBe("");
  });

  it("should handle string with only special characters", () => {
    expect(normalize("   ")).toBe("");
    expect(normalize("'-")).toBe("");
    expect(normalize("' - '")).toBe("");
  });

  it("should preserve numbers", () => {
    expect(normalize("Player123")).toBe("player123");
    expect(normalize("2Pac")).toBe("2pac");
  });

  it("should handle international characters", () => {
    expect(normalize("José")).toBe("josé");
    expect(normalize("Müller")).toBe("müller");
  });
});
