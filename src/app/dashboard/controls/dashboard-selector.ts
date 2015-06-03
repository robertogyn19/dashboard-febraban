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
          showMaxMin: true,
          rotateLabels: 50,
          margin: {
            top: 50
          }
        },
        yAxis: {
          tickFormat: function(d) {
            return numeral(d / 1000).format("$ 0,0.00");
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
          return Configuration.getReducedName(d["key"]);
        },
        y: function(d) {
          return d["count"];
        },
        showLabels: false,
        transitionDuration: 500,
        labelThreshold: 0.01,
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

    constructor(private $scope: ng.IScope,
                private $interval: ng.IIntervalService,
                private $filter: ng.IFilterService,
                private service: DashboardService) {

      this.dateHistoData = [
        {
          key: "Quantity (x 1000)",
          bar: false,
          values: [
            {
              x: 1430784000000 + (3 * 3600 * 1000),
              y: 11373.759899616241
            },
            {
              x: 1430870400000 + (3 * 3600 * 1000),
              y: 5177.699995994568
            }
          ]
        }
      ];

      this.pieChartData = [
        {
          key: "Comércio varejista de produtos alimentícios, bebidas e fumo",
          count: 16
        },
        {
          key: "Comércio varejista de equipamentos de informática e comunicação; equipamentos e artigos de uso doméstico",
          count: 15
        },
        {
          key: "Restaurantes e outros serviços de alimentação e bebidas",
          count: 13
        },
        {
          key: "Comércio varejista de material de construção",
          count: 11
        },
        {
          key: "Comércio varejista de produtos farmacêuticos, perfumaria e cosméticos e artigos médicos, ópticos e ortopédicos",
          count: 11
        },
        {
          key: "Hotéis e similares",
          count: 3
        },
        {
          key: "Comércio varejista de combustíveis para veículos automotores",
          count: 1
        }
      ];
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