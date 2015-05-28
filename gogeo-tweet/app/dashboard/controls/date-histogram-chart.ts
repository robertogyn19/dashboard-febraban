/// <reference path="../../shell.ts" />

module gogeo {
  export class DateHistogramChartController {
    static $inject = [
      "$scope",
      "$timeout",
      DashboardService.$named
    ];

    SIMPLE_DATE_PATTERN: string = "YYYY-MM-DD";
    buckets: Array<IDateHistogram> = [];
    options: any = {};

    constructor(
      private $scope:   ng.IScope,
      private $timeout: ng.ITimeoutService,
      private service:  DashboardService) {

      this.getDataChart();

      this.service.queryObservable
        .where(q => q != null)
        .throttle(400)
        .subscribeAndApply(this.$scope, (query) => this.getDataChart());
    }

    getDataChart() {
      this.service.getDateHistogramAggregation().success((result: Array<IDateHistogram>) => {
        this.buckets = [];
        result.forEach((item) => {
          this.buckets.push(
            {
              timestamp: item['timestamp'] + (3 * 3600 * 1000), // Add time offset +3 hours
              date_string: item['date_string'],
              count: item['count']
            }
          );
        });
        this.configureChartOptions();
      });
    }

    configureChartOptions() {
      var self = this;
      this.options = {
        axes: {
          x: {
            type: "date",
            key: "timestamp",
            ticksFormat: ''
          }
        },
        series: [
          {
            y: "count",
            label: "Transactions over time (by day)",
            type: "line",
            color: "#1CB4DB",
            thickness: "2px",
            striped: true
          }
        ],
        lineMode: "cardinal",
        tooltip: {
          mode: "scrubber",
          formatter: function(x, y, series) {
            return moment(x).format(self.SIMPLE_DATE_PATTERN) + " : " + y;
          }
        }
      };
    }
  }

  registerDirective("dateHistogramChart", () => {
    return {
      restrict: "E",
      templateUrl: "dashboard/controls/date-histogram-chart-template.html",
      controller: DateHistogramChartController,
      controllerAs: "datehisto",
      bindToController: true,

      scope: {
        buckets: "="
      },

      link(scope, element, attrs, controller: DateHistogramChartController) {

      }
    };
  });
}