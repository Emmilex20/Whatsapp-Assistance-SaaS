import type { PilotTest } from "@/generated/prisma/client";

const requiredTestTitles = [
  "Menu request test",
  "Delivery fee test",
  "Order creation test",
  "Address capture test",
  "Human takeover test",
  "Order status update test",
  "Blocked AI safety test",
];

export function getPilotGoLiveStatus(tests: PilotTest[]) {
  const requiredTests = tests.filter((test) =>
    requiredTestTitles.includes(test.title)
  );

  const missingRequired = requiredTestTitles.filter(
    (title) => !tests.some((test) => test.title === title)
  );

  const failedRequired = requiredTests.filter(
    (test) => test.status === "FAILED"
  );

  const incompleteRequired = requiredTests.filter(
    (test) => test.status !== "PASSED"
  );

  const canGoLive =
    missingRequired.length === 0 &&
    failedRequired.length === 0 &&
    incompleteRequired.length === 0;

  return {
    canGoLive,
    requiredCount: requiredTestTitles.length,
    passedRequiredCount: requiredTests.filter(
      (test) => test.status === "PASSED"
    ).length,
    missingRequired,
    failedRequired,
    incompleteRequired,
  };
}
