/// <reference path="../../shell.ts" />
/// <reference path="../services/dashboard-service.ts" />

module gogeo {
  class DashboardSelectorController {
    static $inject = [
        "$scope",
        "$interval",
        "$filter",
        DashboardService.$named
    ];

    selectedDash: boolean = true;
    selectedTop: boolean = false;
    topData: Array<any> = [];
    dateHistoData: Array<any> = [];
    dateHistoOptions: any = {
      chart: {
        type: "lineChart",
        height: 320,
        width: 400,
        margin : {
          top: 20,
          right: 20,
          bottom: 40,
          left: 55
        },
        showValues: true,
        transitionDuration: 500,
        useInteractiveGuideline: true,
        xAxis: {
          axisLabel: "Time",
          tickFormat: function(d) {
            return moment(new Date(d)).format("DD/MM");
          },
          showMaxMin: false,
          rotateLabels: 50,
          margin: {
            top: 50
          }
        },
        yAxis: {
          tickFormat: function(d) {
            return numeral(d / 1000).format("0,0.00");
          },
          margin: {
            left: 25
          }
        }
      }
    };

    pieChartData: Array<any> = [];
    pieChartOptions: any = {
      chart: {
        type: "pieChart",
        height: 500,
        width: 400,
        x: function(d) {
          if (Configuration.getReducedName(d["key"])){
            return Configuration.getReducedName(d["key"]);
          } else {
            return d["key"];
          }
        },
        y: function(d) {
          return d["sum"];
        },
        valueFormat: function(d) {
          return numeral(d).format("R$ 0,0.00");
        },
        showLabels: false,
        transitionDuration: 500,
        labelThreshold: 0.01,
        donut: true,
        legend: {
          key: function(d) {
            return d["x"];
          },
          margin: {
            top: 5,
            right: 35,
            bottom: 5,
            left: 0
          }
        }
      }
    };

    periodData: any = {
      "manhã": {
        sum: 0,
        count: 0
      },
      "tarde": {
        sum: 0,
        count: 0
      },
      "noite": {
        sum: 0,
        count: 0
      }
    };

    constructor(private $scope: ng.IScope,
                private $interval: ng.IIntervalService,
                private $filter: ng.IFilterService,
                private service: DashboardService) {

      this.dateHistoData = [
        {
          key: "R$ (x 1000)",
          type: "line",
          values: []
        }
      ];

      this.pieChartData = [];

      this.service.queryObservable
        .where(q => q != null)
        .throttle(400)
        .subscribe((query) => {
          this.getTopData();
          this.getDateHistoData();
          this.getPieChartData();
          this.getPeriodData();
        });

      this.getTopData();
      this.getDateHistoData();
      this.getPieChartData();
      this.getPeriodData();
    }

    getTotalTransactions() {
      var total = 0;

      for (var i in this.periodData) {
        var item = this.periodData[i];
        total += item["count"];
      };

      return total;
    }

    getPeriodData() {
      this.service.getStatsAggregationSummary().success((result: Array<IStatsAllAgg>) => {
        result.forEach((item) => {
          var pData = this.periodData[item.key];

          pData["count"] = item.count;
          pData["sum"] = item.sum;
        });
      });
    }

    getPieChartData() {
      this.service.getStatsAggregationTypeEstab().success((result: Array<IStatsSumAgg>) => {
        this.pieChartData = result;
      });
    }

    getDateHistoData() {
      this.service.getDateHistogramAggregation().success((result: Array<IDateHistogram>) => {
        var amountValues = [];
        this.dateHistoData[0]["values"] = [];
        result.forEach((item) => {
          amountValues.push({
            x: item["timestamp"] + (3 * 3600 * 1000), // Add time offset +3 hours
            y: item["sum"]
          });
        });

        this.dateHistoData[0]["values"] = amountValues;
      });
    }

    getTopData() {
      this.service.getTopData().success((result: Array<any>) => {
        this.topData = [];

        if (result && result.length > 0) {
          result.sort(
            function(obj1, obj2) {
              return obj2.sum - obj1.sum;
            }
          );

          var maxItems = 10;

          if (result.length < maxItems) {
            maxItems = result.length;
          }

          for (var i = 0; i < maxItems; i++) {
            result[i]["rank"] = (i + 1);
            this.topData[i] = result[i];
          };
        }
      });
    }

    selectButton() {
      this.selectedDash = !this.selectedDash;
      this.selectedTop = !this.selectedTop;
    }
  }

  registerDirective("dashboardSelector", () => {
    return {
      restrict: "CE",
      templateUrl: "dashboard/controls/dashboard-selector-template.html",
      controller: DashboardSelectorController,
      controllerAs: "selector",
      bindToController: true,
      scope: true,

      link(scope, element, attrs, controller: DashboardSelectorController) {
      }
    };
  });
}