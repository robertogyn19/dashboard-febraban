/// <reference path="../../shell.ts" />
/// <reference path="../../dashboard/services/dashboard-service.ts" />

module gogeo {
  export class DashboardClickController {
    static $inject = [
      "$scope",
      "$timeout",
      DashboardService.$named
    ];

    constructor(
        private $scope:   ng.IScope,
        private $timeout: ng.ITimeoutService,
        private service:  DashboardService) {

      this.service.circleObservable
        .where(point => point != null)
        .throttle(400)
        .subscribe((point: L.LatLng) => {
          var geoagg = this.service.getDashboardData(point);
          this.updateDashboardData(geoagg);
        });
    }

    updateDashboardData(geoagg) {
      console.log("updateDashboardData", geoagg);

      geoagg.execute((result: IGogeoAgg) => {
        console.log("result", result);
      });
    }
  };

  registerDirective("dashboardClick", () => {
    return {
      restrict: "E",
      templateUrl: "dashboard/controls/dashboard-click-template.html",
      controller: DashboardClickController,
      controllerAs: "dashclick",
      bindToController: true,

      scope: {},

      link(scope, element, attrs, controller: DashboardClickController) {
      }
    };
  });
}