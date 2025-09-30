import { ThreeDotsLoader } from "@/components/Loading";
import { getDatesList, useAlvioBotAnalytics } from "../lib";
import { DateRangePickerValue } from "@/components/dateRangeSelectors/AdminDateRangeSelector";
import Text from "@/components/ui/text";
import Title from "@/components/ui/title";
import CardSection from "@/components/admin/CardSection";
import { AreaChartDisplay } from "@/components/ui/areaChart";

export function AlvioBotChart({
  timeRange,
}: {
  timeRange: DateRangePickerValue;
}) {
  const {
    data: alvioBotAnalyticsData,
    isLoading: isAlvioBotAnalyticsLoading,
    error: alvioBotAnalyticsError,
  } = useAlvioBotAnalytics(timeRange);

  let chart;
  if (isAlvioBotAnalyticsLoading) {
    chart = (
      <div className="h-80 flex flex-col">
        <ThreeDotsLoader />
      </div>
    );
  } else if (
    !alvioBotAnalyticsData ||
    alvioBotAnalyticsData[0] == undefined ||
    alvioBotAnalyticsError
  ) {
    chart = (
      <div className="h-80 text-red-600 text-bold flex flex-col">
        <p className="m-auto">Failed to fetch feedback data...</p>
      </div>
    );
  } else {
    const initialDate =
      timeRange.from || new Date(alvioBotAnalyticsData[0].date);
    const dateRange = getDatesList(initialDate);

    const dateToAlvioBotAnalytics = new Map(
      alvioBotAnalyticsData.map((alvioBotAnalyticsEntry) => [
        alvioBotAnalyticsEntry.date,
        alvioBotAnalyticsEntry,
      ])
    );

    chart = (
      <AreaChartDisplay
        className="mt-4"
        data={dateRange.map((dateStr) => {
          const alvioBotAnalyticsForDate = dateToAlvioBotAnalytics.get(dateStr);
          return {
            Day: dateStr,
            "Total Queries": alvioBotAnalyticsForDate?.total_queries || 0,
            "Automatically Resolved":
              alvioBotAnalyticsForDate?.auto_resolved || 0,
          };
        })}
        categories={["Total Queries", "Automatically Resolved"]}
        index="Day"
        colors={["indigo", "fuchsia"]}
        yAxisWidth={60}
      />
    );
  }

  return (
    <CardSection className="mt-8">
      <Title>Slack Channel</Title>
      <Text>Total Queries vs Auto Resolved</Text>
      {chart}
    </CardSection>
  );
}
