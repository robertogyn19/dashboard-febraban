/**
 * Created by danfma on 17/03/15.
 */

module gogeo {

    //
    // Configurações para DESENVOLVIMENTO LOCAL
    //

    export var settings = <any>{
        "api.url": "cluster.local.io:9090/",
        "tile.url": "{s}.cluster.local.io:9090/",
        "subdomains": [ "m01", "m02", "m03", "m04" ],
        "collection": "transactions_2"
    };

}
