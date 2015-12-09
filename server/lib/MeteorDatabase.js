var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
MeteorDatabase = (function (_super) {
    __extends(MeteorDatabase, _super);
    function MeteorDatabase(connection) {
        _super.call(this, connection);
    }
    MeteorDatabase.prototype.meteorCollection = function (tableOrTableName, collectionName, fillWithCriteria) {
        var _table;
        if (MysqlWrapper.Helper.isString(tableOrTableName)) {
            _table = this.table(tableOrTableName);
        }
        else if (_table instanceof MysqlWrapper.Table) {
            _table = tableOrTableName;
        }
        var col = new Collection(_table, collectionName);
        col.fill(fillWithCriteria);
        return col;
    };
    return MeteorDatabase;
})(MysqlWrapper.Database);
