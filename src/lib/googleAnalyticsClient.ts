export class GoogleAnalyticsClient {
  constructor(private gaId: string) {}

  fetchKpi() {
    const {
      sessions: dailyPageView,
      users: dailyUsers,
    } = this.fetchDailyMetrics();
    const {
      sessions: weeklyPageView,
      users: weeklyUsers,
    } = this.fetchWeeklyMetrics();

    return {
      dailyPageView,
      dailyUsers,
      weeklyPageView,
      weeklyUsers,
    };
  }

  fetchDailyMetrics() {
    const dataRows = Analytics!.Data!.Ga!.get(
      this.gaId,
      "today",
      "today",
      "ga:sessions, ga:users"
    ).rows;

    return {
      sessions: Number(dataRows![0][0]),
      users: Number(dataRows![0][1]),
    };
  }

  fetchWeeklyMetrics() {
    const dataRows = Analytics!.Data!.Ga!.get(
      this.gaId,
      "7daysAgo",
      "today",
      "ga:sessions, ga:users"
    ).rows;

    return {
      sessions: Number(dataRows![0][0]),
      users: Number(dataRows![0][1]),
    };
  }
}
