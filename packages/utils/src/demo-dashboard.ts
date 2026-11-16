import type { DashboardSnapshot } from "@levelup/types";

/**
 * SAMPLE DATA — for visual development and previews only, shared by web and mobile.
 *
 * Never mixed with real data. Apps show it only when the viewer explicitly opens the
 * sample preview, and every surface that renders it must be labelled "Sample".
 */
export const demoDashboard: DashboardSnapshot = {
  source: "demo",
  priorities: [
    { id: "demo-p1", title: "Finish the quarterly plan draft", status: "done", area: "career" },
    { id: "demo-p2", title: "30-minute run before lunch", status: "open", area: "health" },
    { id: "demo-p3", title: "Call an old friend", status: "open", area: "relationships" },
  ],
  habits: [
    {
      id: "demo-h1",
      name: "Morning pages",
      area: "mind",
      schedule: { type: "daily" },
      dueToday: true,
      completedToday: true,
      currentStreak: 12,
      streakUnit: "day",
      weekProgress: null,
      recentDays: ["done", "done", "done", "done", "done", "done", "done"],
    },
    {
      id: "demo-h2",
      name: "Read 20 pages",
      area: "learning",
      schedule: { type: "daily" },
      dueToday: true,
      completedToday: false,
      currentStreak: 3,
      streakUnit: "day",
      weekProgress: null,
      recentDays: ["missed", "done", "missed", "done", "done", "done", "open"],
    },
    {
      id: "demo-h3",
      name: "Strength training",
      area: "health",
      schedule: { type: "weekly", timesPerWeek: 3 },
      dueToday: true,
      completedToday: true,
      currentStreak: 5,
      streakUnit: "week",
      weekProgress: { completed: 3, total: 3 },
      recentDays: ["done", "off", "done", "off", "off", "done", "done"],
    },
    {
      id: "demo-h4",
      name: "No screens after 10pm",
      area: "health",
      schedule: { type: "daily" },
      dueToday: true,
      completedToday: false,
      currentStreak: 3,
      streakUnit: "day",
      weekProgress: null,
      recentDays: ["missed", "missed", "missed", "done", "done", "done", "open"],
    },
  ],
  goals: [
    {
      id: "demo-g1",
      title: "Run a half marathon",
      area: "health",
      status: "active",
      milestones: { completed: 3, total: 8 },
      targetDate: "2027-04-18",
    },
    {
      id: "demo-g2",
      title: "Launch a personal portfolio",
      area: "career",
      status: "active",
      milestones: { completed: 5, total: 6 },
      targetDate: "2027-01-31",
    },
    {
      id: "demo-g3",
      title: "Build a three-month emergency fund",
      area: "finance",
      status: "active",
      milestones: { completed: 2, total: 10 },
      targetDate: "2027-12-31",
    },
  ],
  learning: [
    {
      id: "demo-l1",
      title: "Foundations of Product Design",
      kind: "course",
      progress: { completed: 7, total: 12 },
      unit: "lessons",
    },
    {
      id: "demo-l2",
      title: "The Practice of Focus",
      kind: "book",
      progress: { completed: 4, total: 14 },
      unit: "chapters",
    },
    {
      id: "demo-l3",
      title: "Conversational Spanish",
      kind: "skill",
      progress: { completed: 9, total: 20 },
      unit: "modules",
    },
  ],
  weeklyActivity: { completions: [4, 6, 3, 5, 7, 2, 5] },
  coachInsight: {
    id: "demo-c1",
    message:
      "You've written morning pages 12 days in a row, and your most productive days start with them.",
    suggestion: "Read your 20 pages straight after morning pages to ride that momentum.",
  },
};

/**
 * The live dashboard until module data sources exist: honestly empty, no invented numbers.
 */
export const emptyDashboard: DashboardSnapshot = {
  source: "live",
  priorities: [],
  habits: [],
  goals: [],
  learning: [],
  weeklyActivity: null,
  coachInsight: null,
};
