/// <reference path="../../shell.ts" />
/// <reference path="../../dashboard/services/dashboard-service.ts" />

module gogeo {
  export class DashboardCrimesController {
    static $inject = [
      "$scope",
      DashboardService.$named
    ];

    crimes: Array<IBucket> = [];

    constructor(
        private $scope:   ng.IScope,
        private service:  DashboardService) {

      this.service.crimesObservable
        .where(result => result != null)
        .subscribe((result: IGogeoGeoAgg) => {
          this.handleCrimesResult(result);
        });
    }

    handleCrimesResult(result: IGogeoGeoAgg) {
      this.crimes = result.buckets.slice(0, 5);
      // console.log("crimes", this.crimes);
    }
  }

  registerDirective("dashboardCrimes", () => {
    return {
      restrict: "E",
      templateUrl: "dashboard/controls/dashboard-crimes-template.html",
      controller: DashboardCrimesController,
      controllerAs: "dashcrimes",
      bindToController: true,

      scope: {},

      link(scope, element, attrs, controller: DashboardCrimesController) {
      }
    };
  });
}