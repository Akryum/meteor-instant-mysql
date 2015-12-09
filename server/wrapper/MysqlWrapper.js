if (Function.prototype["name"] === undefined) {
    Object.defineProperty(Function.prototype, 'name', {
        get: function () {
            return /function ([^(]*)/.exec(this + "")[1];
        }
    });
}
function wrap(mysqlUrlOrObjectOrMysqlAlreadyConnection) {
    var useTables = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        useTables[_i - 1] = arguments[_i];
    }
    var mysqlCon = new Connection(mysqlUrlOrObjectOrMysqlAlreadyConnection);
    var mysqlDatabase = new Database(mysqlCon);
    if (useTables && useTables !== null) {
        mysqlDatabase.useOnly(useTables);
    }
    return mysqlDatabase;
}
function observable(obj) {
    return new ObservableObject(obj);
}
MysqlWrapper = {
    wrap:wrap,
    observable:observable,
    Helper:Helper,
    Table:Table,
    TABLE_RULES_PROPERTY:SelectQueryRules.TABLE_RULES_PROPERTY,
    TableToSearchPart:{tableName: "", propertyName: ""},
    ConditionalConverter:ConditionalConverter,
    Connection:Connection,
    Database:Database,
    SelectQueryRules:SelectQueryRules,
    CriteriaBuilder:CriteriaBuilder,
    CollectionChangedAction:BaseCollection.CollectionChangedAction,
    ObservableObject:ObservableObject
};