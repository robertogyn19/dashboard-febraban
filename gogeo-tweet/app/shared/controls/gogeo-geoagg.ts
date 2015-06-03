module gogeo {
  interface IAggValue {
    value: number;
  }

  interface IAgg {
    [aggName: string]: IAggValue;
  }

  export interface IGogeoAgg {
    aggregations: IAgg;
  }

  export class GogeoGeoagg {
    private params: any = {};

    constructor(
      private $http: ng.IHttpService,
      geom: IGeom,
      field: string,
      buffer: number,
      size?: number) {

      if (!size) {
        size = 50;
      }

      this.params = {
        mapkey: Configuration.getMapKey(),
        geom: geom,
        field: field,
        agg_size: size,
        buffer: buffer,
        measure_buffer: "kilometer"
      };
    }

    execute(resultHandler: (IGogeoAgg) => void) {
      var url = Configuration.makeUrl("geoagg");
      var requestData = this.params;

      return this.$http
        .post<IGogeoAgg>(url, requestData)
        .success(resultHandler);
    }
  }
}