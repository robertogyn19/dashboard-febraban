/// <reference path="../../shell.ts" />

module gogeo {
  export class RadiusSliderController {
    static $inject = [
      "$scope",
      "$timeout"
    ];

    radius: number = 4.5;
    radiusObservale: Rx.BehaviorSubject<number> = new Rx.BehaviorSubject<number>(0);

    constructor(
      private $scope:   ng.IScope,
      private $timeout: ng.ITimeoutService) {
      Rx.Observable
        .merge<any>(this.radiusObservale)
        .throttle(200)
        .subscribe(() => {
          console.log("subcribe", this.radius);
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
              floor="1"
              ceiling="10"
              precision="1"
              step="0.5">
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