/**
 * Created by danfma on 17/03/15.
 */
var gogeo;
(function (gogeo) {
    //
    // Configurações para DESENVOLVIMENTO LOCAL
    //
    gogeo.settings = {
        "api.url": "cluster.local.io:9090/",
        "tile.url": "{s}.cluster.local.io:9090/",
        "subdomains": [ "m01", "m02", "m03", "m04" ],
        "collection": "transactions_2"
    };
})(gogeo || (gogeo = {}));
//# sourceMappingURL=development.js.map