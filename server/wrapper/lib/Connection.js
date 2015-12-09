var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Mysql = Npm.require('mysql');
var Promise = Npm.require('bluebird');
var events = Npm.require('events');
var ZongJi = Npm.require("zongji");
Connection = (function (_super) {
    __extends(Connection, _super);
    function Connection(connection) {
        _super.call(this);
        this.eventTypes = ["INSERT", "UPDATE", "DELETE"];
        this.tableNamesToUseOnly = [];
        this.tables = [];
        this.allowBinaryLogs = false;
        this.mysql_5_6_x_query = "SELECT * from information_schema.GLOBAL_VARIABLES WHERE VARIABLE_NAME = 'LOG_BIN';";
        this.mysql_5_7_9_query = "SELECT * FROM performance_schema.global_variables WHERE VARIABLE_NAME = 'LOG_BIN';";
        this.create(connection);
    }
    Connection.prototype.create = function (connection) {
        if (typeof connection === "string" || connection instanceof String) {
            this.attach(Mysql.createConnection(connection));
        }
        else if (connection["host"] !== undefined) {
            this.attach(Mysql.createConnection(connection));
        }
        else {
            this.attach(connection);
        }
    };
    Connection.prototype.attach = function (connection) {
        this.connection = connection;
    };
    Connection.prototype.end = function (callback) {
        var _this = this;
        if (this.zongji) {
            this.zongji.stop();
        }
        this.eventTypes.forEach(function (_evt) {
            _this.removeAllListeners(_evt);
        });
        this.connection.end(function (err) {
            callback(err);
        });
    };
    Connection.prototype.destroy = function () {
        var _this = this;
        if (this.zongji) {
            this.zongji.stop();
        }
        this.eventTypes.forEach(function (_evt) {
            _this.removeAllListeners(_evt);
        });
        this.connection.destroy();
    };
    Connection.prototype.clearBinaryLogs = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.query("RESET MASTER", function (err, noresults) {
                resolve();
            });
        });
    };
    Connection.prototype.watchBinaryLogs = function (callbackWhenReady) {
        var _this = this;
        if (!this.allowBinaryLogs) {
            console.log("Binary logs are off.\n Please google 'Enable Binary logs in MySQL' , and restart your mysql server and NodeJS/Meteor server.");
        }
        else {
            if (!this.zongji || this.zongji === undefined) {
                this.zongji = new ZongJi(this.connection.config);
                this.clearBinaryLogs().then(() => {
                    _this.zongji.on('binlog', function (evt) {
                        //  evt.dump();
                        //edw 9a ginei to emit , apo this.notice me ta katalila events kai table.
                        var _evtName = evt.constructor.name;
                        if (_evtName !== "TableMap") {
                            if (_evtName === "WriteRows") {
                                _evtName = "INSERT";
                            }
                            else if (_evtName === "UpdateRows") {
                                _evtName = "UPDATE";
                            }
                            else if (_evtName === "DeleteRows") {
                                _evtName = "DELETE";
                            }
                            var _tableName = evt.tableMap[evt.tableId].tableName;
                            _this.notice(_tableName, _evtName, evt.rows);
                        }
                        else {
                        }
                    });
                    _this.zongji.start({
                        includeEvents: ['tablemap', 'writerows', "updaterows", "deleterows"]
                    });
                    if (callbackWhenReady) {
                        callbackWhenReady();
                    }
                });
            }
            else {
                if (callbackWhenReady) {
                    callbackWhenReady();
                }
            }
        }
    };
    Connection.prototype.link = function (readyCallback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var callback = readyCallback ||
                (function (err) {
                    if (err) {
                        console.error('MYSQL: error connecting: ' + err.stack);
                        reject(err.stack);
                    }
                    _this.fetchDatabaseInformation().then(() => {
                        _this.fetchBinaryInformation().then(() => {
                            resolve();
                        });
                    });
                });
            if (_this.connection['state'] === 'disconnected' || _this.connection['state'] === 'connecting') {
                _this.connection.connect(callback);
            }
            else {
                callback();
                resolve();
            }
        });
    };
    Connection.prototype.useOnly = function () {
        var tables = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tables[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < tables.length; i++) {
            var _table = tables[i];
            if (typeof _table === 'string' || _table instanceof String) {
                this.tableNamesToUseOnly.push(_table);
            }
            else {
                for (var j = 0; j < _table.length; j++) {
                    this.tableNamesToUseOnly.push(_table[j]);
                }
            }
        }
    };
    Connection.prototype.getBinaryInformationResult = function (cb, q) {
        var _this = this;
        if (!q) {
            q = this.mysql_5_7_9_query;
        }
        this.connection.query(q, function (err) {
            var results = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                results[_i - 1] = arguments[_i];
            }
            if (err) {
                if (q !== _this.mysql_5_6_x_query) {
                    _this.getBinaryInformationResult(cb, _this.mysql_5_6_x_query);
                }
                else {
                    cb(err, []);
                }
            }
            else {
                cb(undefined, results);
            }
        });
    };
    Connection.prototype.fetchBinaryInformation = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getBinaryInformationResult(function (err, results) {
                if (err !== undefined) {
                    reject(err);
                }
                if (results.length > 0 && Array.isArray(results[0])) {
                    if (results[0][0]["VARIABLE_VALUE"] === 'ON') {
                        _this.allowBinaryLogs = true;
                    }
                }
                resolve();
            });
        });
    };
    Connection.prototype.fetchDatabaseInformation = function () {
        //Ta kanw ola edw gia na doulepsei to def.resolve kai na einai etoimo olo to module molis ola ta tables kai ola ta columns dhlwthoun.
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connection.query("SELECT DISTINCT TABLE_NAME ,column_name FROM INFORMATION_SCHEMA.key_column_usage WHERE TABLE_SCHEMA IN ('" + _this.connection.config.database + "');", function (err) {
                var results = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    results[_i - 1] = arguments[_i];
                }
                if (err) {
                    reject(err);
                }
                if (results.length > 0 && Array.isArray(results[0]) && results[0].length > 0) {
                    results[0].forEach(function (tableObj, currentPosition) {
                        if (_this.tableNamesToUseOnly.length > 0 && _this.tableNamesToUseOnly.indexOf(tableObj.TABLE_NAME) !== -1) {
                        }
                        else {
                            var _table = new Table(tableObj.TABLE_NAME, _this);
                            _table.primaryKey = (tableObj.column_name);
                            _this.connection.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '" + _this.connection.config.database + "' AND TABLE_NAME = '" + _table.name + "';", function (errC) {
                                var resultsC = [];
                                for (var _i = 1; _i < arguments.length; _i++) {
                                    resultsC[_i - 1] = arguments[_i];
                                }
                                if (errC) {
                                    reject(err);
                                }
                                var _tableColumns = [];
                                for (var i = 0; i < resultsC[0].length; i++) {
                                    var _columnName = resultsC[0][i]['COLUMN_NAME'];
                                    if (_columnName !== _table.primaryKey) {
                                        _tableColumns.push(_columnName);
                                    }
                                }
                                _table.columns = (_tableColumns);
                                _this.tables.push(_table);
                                if (currentPosition === results[0].length - 1) {
                                    resolve();
                                }
                            });
                        }
                    });
                }
                else {
                    reject("No infromation can be fetched by your database, please check your permissions");
                }
            });
        });
    };
    Connection.prototype.escape = function (val) {
        return this.connection.escape(val);
    };
    Connection.prototype.notice = function (tableWhichCalled, evtType, parsedResults) {
        if (evtType !== undefined) {
            evtType = evtType.toUpperCase();
            if (this.eventTypes.indexOf(evtType) !== -1) {
                this.emit(tableWhichCalled.toUpperCase() + "." + evtType, parsedResults);
            }
        }
    };
    Connection.prototype.watch = function (tableName, evtType, callback) {
        this.watchBinaryLogs();
        if (Array.isArray(evtType)) {
            for (var i = 0; i < evtType.length; i++) {
                var _theEventType = evtType[i].toUpperCase();
                if (this.eventTypes.indexOf(_theEventType) !== -1) {
                    this.on(tableName.toUpperCase() + "." + _theEventType, callback);
                }
            }
        }
        else {
            evtType = evtType.toUpperCase();
            if (this.eventTypes.indexOf(evtType) !== -1) {
                this.on(tableName.toUpperCase() + "." + evtType, callback);
            }
        }
    };
    Connection.prototype.unwatch = function (tableName, evtType, callbackToRemove) {
        evtType = evtType.toUpperCase();
        if (this.eventTypes.indexOf(evtType) !== -1) {
            this.removeListener(tableName.toUpperCase() + "." + evtType, callbackToRemove);
        }
    };
    Connection.prototype.query = function (queryStr, callback, queryArguments) {
        if (queryArguments) {
            this.connection.query(queryStr, queryArguments, function (err, results, fields) {
                if (results === undefined) {
                    results = [];
                }
                callback(err, results, fields);
            });
        }
        else {
            this.connection.query(queryStr, function (err, results, fields) {
                if (results === undefined) {
                    results = [];
                }
                callback(err, results, fields);
            });
        }
    };
    Connection.prototype.table = function (tableName) {
        for (var i = 0; i < this.tables.length; i++) {
            if (this.tables[i].name === tableName || this.tables[i].name === Helper.toObjectProperty(tableName)) {
                return this.tables[i];
            }
        }
        return undefined;
    };
    return Connection;
})(events.EventEmitter);
