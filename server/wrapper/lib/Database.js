var Promise = Npm.require('bluebird');
Database = (function () {
    function Database(connection) {
        this.readyListenerCallbacks = new Array();
        this.isReady = false;
        this.isConnecting = false;
        this.setConnection(connection);
    }
    Database.when = function () {
        var _promises = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _promises[_i - 0] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            //  let promises = Array.prototype.slice.call(arguments);
            if (Array.isArray(_promises[0])) {
                _promises = Array.prototype.slice.call(_promises[0]);
            }
            Promise.all(_promises).then(function (results) {
                resolve(results);
            }).catch(function (_err) { reject(_err); });
        });
    };
    Database.prototype.setConnection = function (connection) {
        this.connection = connection;
    };
    Database.prototype.useOnly = function () {
        var useTables = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            useTables[_i - 0] = arguments[_i];
        }
        this.connection.useOnly(useTables);
    };
    Database.prototype.has = function (tableName, functionName) {
        if (this[tableName] !== undefined) {
            if (functionName) {
                return this[tableName][functionName] !== undefined;
            }
            else {
                return true;
            }
        }
        return false;
    };
    Database.prototype.ready = function (callback) {
        var _this = this;
        if (callback && this.isReady === true && this.isConnecting === false) {
            callback();
        }
        else {
            if (callback) {
                this.readyListenerCallbacks.push(callback);
            }
            if (this.readyListenerCallbacks.length <= 1 && this.isConnecting === false) {
                this.isConnecting = true;
                this.connection.link().then(function () {
                    [].forEach.call(_this.connection.tables, function (_table) {
                        _this[Helper.toObjectProperty(_table.name)] = _this[_table.name] = _table;
                    });
                    _this.noticeReady();
                });
            }
        }
    };
    Database.prototype.table = function (tableName) {
        return this.connection.table(tableName);
    };
    Database.prototype.criteriaFor = function (tableName) {
        return new CriteriaBuilder(this.table(tableName));
    };
    Database.prototype.noticeReady = function () {
        this.isConnecting = false;
        this.isReady = true;
        for (var i = 0; i < this.readyListenerCallbacks.length; i++) {
            this.readyListenerCallbacks[i]();
        }
        this.readyListenerCallbacks = [];
    };
    Database.prototype.removeReadyListener = function (callback) {
        for (var i = 0; i < this.readyListenerCallbacks.length; i++) {
            if (this.readyListenerCallbacks[i] === callback) {
                this.readyListenerCallbacks.slice(i, 1);
                break;
            }
        }
    };
    Database.prototype.query = function (queryStr, callback, queryArguments) {
        this.connection.query(queryStr, callback, queryArguments);
    };
    Database.prototype.destroy = function () {
        this.isReady = false;
        this.readyListenerCallbacks = [];
        this.connection.destroy();
    };
    Database.prototype.end = function (maybeAcallbackError) {
        this.isReady = false;
        this.readyListenerCallbacks = [];
        this.connection.end(maybeAcallbackError);
    };
    Database.prototype.newTableRules = function (tableName) {
        var tbRule = new SelectQueryRules();
        this.table(tableName).rules = tbRule;
        return tbRule;
    };
    Database.prototype.buildRules = function (parentRules) {
        var newRules = new SelectQueryRules();
        if (parentRules) {
            newRules.from(parentRules);
        }
        return newRules;
    };
    Database.prototype.collection = function (tableName, callbackWhenReady) {
        return new ObservableCollection(this.connection.table(tableName), true, callbackWhenReady);
    };
    Database.prototype.call = function (procedureName, params, callback) {
        var _this = this;
        if ((this.connection.connection.config["connectionConfig"] !== undefined && (this.connection.connection.config["connectionConfig"]["multipleStatements"] === undefined || this.connection.connection.config["connectionConfig"]["multipleStatements"] === false)) ||
            (this.connection.connection.config["multipleStatements"] === undefined || this.connection.connection.config["multipleStatements"] === false)) {
            throw new Error("[MySQL] Error calling a procedure " + procedureName + ". Please create your connection with setted option multipleStatements = true. \n" +
                "eg. At node-mysql-wrapper do: wrap({ user: 'kataras', password :'password', database: 'test', multipleStatements: true}); \n " +
                "eg. At mysql-live package do: live({ user: 'kataras', password: 'password', database: 'test', multipleStatements: true},http); \n" +
                "eg. At Meteor's package nodets:mysql do: Mysql.connect({ user: 'kataras', password: 'password', database: 'test', multipleStatements: true});\n" +
                "Your parameters will be auto-escape, so dont worry for mysql injections at this point.\n" +
                "The callback's results will be at the row mysql column's name, means that for example user_id will be reamain as user_id, if you want the userId format,\n" +
                "then use the Helper.toObjectProperty(propertyName); class inside node-mysql-wrapper package.\n" +
                "Please keep noice that, this is a beta feature if you have any issue please post it to https://github.com/nodets/node-mysql-wrapper/issues");
        }
        params.map(function (param) { return _this.connection.escape(param); });
        this.connection.query("CALL " + procedureName + "(" + (params !== undefined && params.length > 0 ? params.join(',') : "") + ")", function (err, results, fields) {
            if (err || results[0].res === 0) {
                throw new Error("[MySQL] Error calling a procedure " + procedureName + " . Error info:" + err);
            }
            else {
                callback(results, fields);
            }
        });
    };
    return Database;
})();