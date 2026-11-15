import type { LearningKind, LifeArea } from "@levelup/types";

/**
 * Locale used for formatting on every platform. Fixed (rather than read from the
 * device) so server-rendered web output matches hydration exactly.
 * Replace with per-user locale resolution when internationalisation lands.
 */
export const APP_LOCALE = "en-GB";

export const lifeAreaLabels: Record<LifeArea, string> = {
  health: "Health",
  mind: "Mind",
  career: "Career",
  learning: "Learning",
  relationships: "Relationships",
  finance: "Finance",
  creativity: "Creativity",
};

export const learningKindLabels: Record<LearningKind, string> = {
  course: "Course",
  book: "Book",
  skill: "Skill",
  article: "Article",
};
