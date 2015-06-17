/// <reference path="../../shell.ts" />

module gogeo {
  export class RadiusSliderController {
    static $inject = [
      "$scope",
      "$timeout",
      DashboardService.$named
    ];

    radius: number = 0.5;
    radiusObservale: Rx.BehaviorSubject<number> = new Rx.BehaviorSubject<number>(0);

    constructor(
      private $scope:   ng.IScope,
      private $timeout: ng.ITimeoutService,
      private service:  DashboardService) {

      Rx.Observable
        .merge<any>(this.radiusObservale)
        .throttle(200)
        .subscribe(() => {
          this.service.updateRadius(this.radius);
        });
    }

    updateRadius() {
      if (this.radius != this.radiusObservale["value"]) {
        this.radiusObservale.onNext(this.radius);
      }
    }
  }

  registerDirective("radiusSlider", () => {
    return {
      restrict: "E",
      template: `
        <div class="container-fluid">
          <slider
              ng-model="slider.radius"
              ng-change="slider.updateRadius()"
              floor="0.1"
              ceiling="5"
              precision="1"
              step="0.1">
          </slider>
        </div>
      `,
      controller: RadiusSliderController,
      controllerAs: "slider",
      bindToController: true,

      scope: {
      },

      link(scope, element, attrs, controller: RadiusSliderController) {

      }
    };
  });

}