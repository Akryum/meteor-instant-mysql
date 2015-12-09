function connect(mysqlUrlOrObjectOrMysqlAlreadyConnection) {
    var useTables = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        useTables[_i - 1] = arguments[_i];
    }
    if (Meteor) {
        Future = Npm.require("fibers/future");
    }
    var future = new Future;
    var mysqlCon = new MysqlWrapper.Connection(mysqlUrlOrObjectOrMysqlAlreadyConnection);
    var mysqlDatabase = new MeteorDatabase(mysqlCon);
    if (useTables && useTables !== null) {
        mysqlDatabase.useOnly(useTables);
    }
    mysqlDatabase.ready(function () {
        future.return(mysqlDatabase);
    });
    return future.wait();
}
Mysql = Collection;
Mysql.connect = connect;
Mysql.Collection = Collection;
