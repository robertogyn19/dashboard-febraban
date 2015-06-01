/// <reference path="../../shell.ts" />

module gogeo {
  export class DateHistogramChartController {
    static $inject = [
      "$scope",
      "$timeout",
      DashboardService.$named
    ];

    SIMPLE_DATE_PATTERN: string = "YYYY-MM-dd";
    // buckets: Array<IDateHistogram> = [];
    buckets: any = [];
    options: any = {
      chart: {
        type: 'historicalBarChart',
        height: 380,
        width: 430,
        margin : {
          top: 20,
          right: 20,
          bottom: 40,
          left: 55
        },
        showValues: true,
        transitionDuration: 500,
        xAxis: {
          axisLabel: "Time",
          tickFormat: function(d) {
            return moment(new Date(d)).format("DD/MM/YYYY");
          },
          showMaxMin: true,
          rotateLabels: 50
        },
        yAxis: {
          axisLabel: "Count (k)",
          tickFormat: function(d) {
            return (d / 1000).toFixed(2);
          },
          axisLabelDistance: 30
        },
        bars: {
          padData: true,
          clipEdge: false
        }
      }
    };

    config: any = {
      autorefresh: false,
      refreshDataOnly: true,
      debounce: 200
    }

    constructor(
      private $scope:   ng.IScope,
      private $timeout: ng.ITimeoutService,
      private service:  DashboardService) {

      this.service.queryObservable
        .where(q => q != null)
        .throttle(400)
        .subscribeAndApply(this.$scope, (query) => this.getDataChart());

      this.buckets = [
        {
          key: "Quantity",
          bar: true,
          values: []
        }
      ];
    }

    getDataChart() {
      this.service.getDateHistogramAggregation().success((result: Array<IDateHistogram>) => {
        var values = [];
        this.buckets["values"] = [];
        result.forEach((item) => {
          values.push({
            x: item['timestamp'] + (3 * 3600 * 1000), // Add time offset +3 hours
            y: item['count']
          });
        });

        this.buckets[0]["values"] = values;
      });
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