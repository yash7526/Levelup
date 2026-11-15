export type ModuleKey = "today" | "habits" | "goals" | "learning" | "coach";

export interface ModuleCopy {
  title: string;
  tagline: string;
  /** What the module will let people do once it ships. */
  plannedCapabilities: readonly string[];
  /** How the dashboard will reflect the module. */
  dashboardNote: string;
}

/** Copy for modules that are planned but not yet built. Shared by web and mobile. */
export const moduleCopy: Record<ModuleKey, ModuleCopy> = {
  today: {
    title: "Today",
    tagline: "Decide what matters most, then give it your best hours.",
    plannedCapabilities: [
      "Pick up to three priorities for the day",
      "See today's habits alongside your priorities",
      "Carry unfinished priorities over to tomorrow",
      "A short evening check-in to close the day",
    ],
    dashboardNote:
      "Once it's ready, your priorities and today's progress will appear on the dashboard.",
  },
  habits: {
    title: "Habits",
    tagline: "Small, repeatable actions that compound into who you become.",
    plannedCapabilities: [
      "Create daily or weekly habits with flexible schedules",
      "Check in with a single tap",
      "Streaks and a seven-day view for every habit",
      "Gentle reminders at the times you choose",
    ],
    dashboardNote: "Once it's ready, your habits and streaks will appear on the dashboard.",
  },
  goals: {
    title: "Goals",
    tagline: "Turn long-term ambitions into milestones you can actually see yourself reach.",
    plannedCapabilities: [
      "Set goals across health, career, learning and more",
      "Break each goal into clear milestones",
      "Progress measured by milestones, not guesswork",
      "Link habits and priorities to the goals they serve",
    ],
    dashboardNote:
      "Once it's ready, your active goals and their progress will appear on the dashboard.",
  },
  learning: {
    title: "Learning",
    tagline: "Keep the courses, books and skills you're working through moving forward.",
    plannedCapabilities: [
      "A personal library of courses, books, skills and articles",
      "Track progress by lessons, chapters, pages or modules",
      "Log short learning sessions as you go",
      "Capture notes and key takeaways",
    ],
    dashboardNote: "Once it's ready, what you're learning will appear on the dashboard.",
  },
  coach: {
    title: "AI Coach",
    tagline: "Personal guidance grounded in your own habits, goals and progress.",
    plannedCapabilities: [
      "Spots patterns in what helps you follow through",
      "Suggests one focused next step each day",
      "Guided weekly reflection",
      "You control what the coach can see",
    ],
    dashboardNote: "Once it's ready, a daily insight from your coach will appear on the dashboard.",
  },
};

/** Shown on the dashboard's AI Coach preview before the coach exists. */
export const coachCapabilities = [
  "Notices patterns across your habits, goals and priorities",
  "Suggests one focused next step each day",
  "Helps you reflect at the end of the week",
] as const;
