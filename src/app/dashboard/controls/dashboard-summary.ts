/// <reference path="../../shell.ts" />
/// <reference path="../../dashboard/services/dashboard-service.ts" />

module gogeo {
  export class DashboardSummaryController {
    static $inject = [
      "$scope",
      "$timeout",
      DashboardService.$named
    ];

    crimes: Array<IBucket> = [
    ];

    companies: number = 0;
    crimesCount: number = 0;
    households: number = 0;
    families: number = 0;
    nonfamily: number = 0;
    householdsIncome: number = 0;

    constructor(
        private $scope:   ng.IScope,
        private $timeout: ng.ITimeoutService,
        private service:  DashboardService) {

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

          this.handleCrimesResult(this.service.crimesGeoAgg(geom));
          this.handleCompaniesResult(this.service.businessGeoAgg(geom));
          this.service.updateCensus(geom);
        });

      this.service.censusObservable
        .where(result => result != null)
        .subscribe((result: Array<ICensusDocument>) => {
          this.handleCensusResult(result);
        });
    }

    handleCrimesResult(geoagg: GogeoGeoagg) {
      geoagg.execute((result: IGogeoGeoAgg) => {
        this.crimesCount = result.doc_total;
        this.crimes = result.buckets.slice(0, 5);
      });
    }

    handleCompaniesResult(geoagg: GogeoGeoagg) {
      geoagg.execute((result: IGogeoGeoAgg) => {
        this.companies = result.doc_total;
      });
    }

    handleCensusResult(result: Array<ICensusDocument>) {
      var avg = 0;
      this.households = this.families = this.nonfamily = this.householdsIncome = 0;

      result.forEach((item) => {
        this.households += item.households;
        this.families += item.families;
        this.nonfamily += item.nonfamily;
        avg += item.household_median_income;
      });

      this.householdsIncome = this.calculateWeightedAverage(result);
    }

    calculateWeightedAverage(result: Array<ICensusDocument>): number {
      var pi = 0;
      var sh = 0;
      result.forEach((item) => {
        sh += item.households;
        pi += (item.household_median_income * item.households);
      });

      return pi / sh;
    }
  };

  registerDirective("dashboardSummary", () => {
    return {
      restrict: "E",
      templateUrl: "dashboard/controls/dashboard-summary-template.html",
      controller: DashboardSummaryController,
      controllerAs: "dashsummary",
      bindToController: true,

      scope: {},

      link(scope, element, attrs, controller: DashboardSummaryController) {
      }
    };
  });
}