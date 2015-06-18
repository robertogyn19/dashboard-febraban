/// <reference path="../../shell.ts" />
/// <reference path="../../dashboard/services/dashboard-service.ts" />

module gogeo {
  export class DashboardCensusController {
    barChartOptions: any = {
      chart: {
        type: "discreteBarChart",
        height: 300,
        width: 450,
        margin: {
          top: 20,
          right: 20,
          bottom: 40,
          left: 55
        },
        x: function(d) { return d.label; },
        y: function(d) { return d.value; },
        useInteractiveGuideline: true,
        dispatch: {},
        showXAxis: false,
        tooltipContent: function(key, x, y, obj) {
          y = numeral(y).format("0");

          var content = '<h3>' + obj.point.label + '</h3>'
                + '<p>' + y + '</p>'

          return content;
        },
        transitionDuration: 250
      }
    };
    incomeChartOptions: any = {};
    ageChartOptions: any = {};

    pieChartOptions: any = {
      chart: {
        type: "pieChart",
        height: 400,
        width: 400,
        x: function(d) { return d.label; },
        y: function(d) { return d.value; },
        showLabels: false,
        transitionDuration: 500,
        showLegend: true,
        donut: true,
        margin: {
          top: -50,
          left: 10,
        },
        tooltipContent: function(key, y, e) {
          var tooltip = e.point.tooltip || key;
          y = numeral(y).format("0");

          var content = '<h3 style="background-color: '
                + e.color + '">' + tooltip + '</h3>'
                + '<p>' +  y + '</p>'

          return content;
        },
        legend: {
          width: 400,
          height: 300,
          key: function(d) {
            return d.key;
          },
          margin: {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
          }
        }
      },
      title: {
        enable: true,
        text: "Races chart"
      }
    };

    racesData: Array<any> = [
      {
        key: "white",
        label: "White",
        tooltip: "White",
        value: 0
      },
      {
        key: "black",
        label: "Black",
        tooltip: "Black or African American",
        value: 0
      },
      {
        key: "indian",
        label: "Indian",
        tooltip: "American Indian and Alaska Native",
        value: 0
      },
      {
        key: "asian",
        label: "Asian",
        tooltip: "Asian",
        value: 0
      },
      {
        key: "hawaiian",
        label: "Hawaiian",
        tooltip: "Native Hawaiian and Other Pacific Islander",
        value: 0
      },
      {
        key: "others",
        label: "Others",
        tooltip: "Some Other Race",
        value: 0
      },
      {
        key: "two_races",
        label: "Two or More Races",
        tooltip: "Two or More Races",
        value: 0
      }
    ];

    ageData: Array<any> = [
      {
        key: "Age",
        values: [
          {
            label: "Under 5 years",
            key: "age_under_5",
            value: 0,
            color: "#D53E4F"
          },
          {
            label: "5 to 19 years",
            key: "age_5_19",
            value: 0,
            color: "#FC8D59"
          },
          {
            label: "20 to 29 years",
            key: "age_20_29",
            value: 0,
            color: "#8C510A"
          },
          {
            label: "30 to 44 years",
            key: "age_30_44",
            value: 0,
            color: "#01665E"
          },
          {
            label: "45 to 64 years",
            key: "age_45_64",
            value: 0,
            color: "#5AB4AC"
          },
          {
            label: "65 years and over",
            key: "age_85_over",
            value: 0,
            color: "#3288BD"
          }
        ]
      }
    ];

    incomeData: Array<any> = [
      {
        key: "Income per Household",
        values: [
          {
            label: "Less than $15,000",
            key: "household_income_less_15k",
            value: 0,
            color: "#053061"
          },
          {
            label: "$15,000 to $34,999",
            key: "household_income_15k_35k",
            value: 0,
            color: "#2166AC"
          },
          {
            label: "$35,000 to $74,999",
            key: "household_income_35k_75k",
            value: 0,
            color: "#4393C3"
          },
          {
            label: "$75,000 to $149,999",
            key: "household_income_75k_150k",
            value: 0,
            color: "#D6604D"
          },
          {
            label: "$150,000 to $199,999",
            key: "household_income_150k_200k",
            value: 0,
            color: "#B2182B"
          },
          {
            label: "$200,000 and over",
            key: "household_income_200k_more",
            value: 0,
            color: "#67001F"
          }
        ]
      }
    ];

    static $inject = [
      "$scope",
      DashboardService.$named
    ];

    constructor(
        private $scope:  ng.IScope,
        private service: DashboardService) {

      this.incomeChartOptions = _.clone(this.barChartOptions);
      this.incomeChartOptions["title"] = {
        enable: true,
        text: "Household Income Chart"
      };

      this.ageChartOptions = _.clone(this.barChartOptions);
      this.ageChartOptions["title"] = {
        enable: true,
        text: "Age Chart"
      };

      this.service.circleObservable
        .where(point => point != null)
        .throttle(400)
        .subscribe((point: L.LatLng) => {
          var geom = <IPoint>{
            type: "Point",
            coordinates: [
              point.lng, point.lat
            ]
          };

          this.service.updateCensus(geom);
        });

      this.service.censusObservable
        .where(result => result != null)
        .subscribe((result: Array<ICensusDocument>) => {
          this.handleCensusResult(result);
        });
    }

    handleCensusResult(result: Array<ICensusDocument>) {
      this.racesData.forEach((race) => {
        var key = race["key"];
        race["value"] = 0;

        result.forEach((item) => {
          race["value"] += item[key];
        });
      });

      this.ageData[0]["values"].forEach((age) => {
        var key = age["key"];
        age["value"] = 0;

        result.forEach((item) => {
          age["value"] += item[key];
        });
      });

      this.incomeData[0]["values"].forEach((income) => {
        var key = income["key"];
        income["value"] = 0;

        result.forEach((item) => {
          income["value"] += item[key];
        });
      });
    }
  };

  registerDirective("dashboardCensus", () => {
    return {
      restrict: "E",
      templateUrl: "dashboard/controls/dashboard-census-template.html",
      controller: DashboardCensusController,
      controllerAs: "dashcensus",
      bindToController: true,

      scope: {},

      link(scope, element, attrs, controller: DashboardCensusController) {
      }
    };
  });
}