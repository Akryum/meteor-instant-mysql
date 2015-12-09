var Promise = Npm.require('bluebird');
Table = (function () {
    function Table(tableName, connection) {
        this._name = tableName;
        this._connection = connection;
        this._criteriaDivider = new CriteriaDivider(this);
        this._rules = new SelectQueryRules();
        this._selectQuery = new SelectQuery(this);
        this._saveQuery = new SaveQuery(this);
        this._deleteQuery = new DeleteQuery(this);
    }
    Object.defineProperty(Table.prototype, "columns", {
        get: function () {
            return this._columns;
        },
        set: function (cols) {
            this._columns = cols;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "primaryKey", {
        get: function () {
            return this._primaryKey;
        },
        set: function (prkey) {
            this._primaryKey = prkey;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "connection", {
        get: function () {
            return this._connection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "rules", {
        get: function () {
            return this._rules;
        },
        set: function (_rules) {
            this._rules = _rules;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "criteriaDivider", {
        get: function () {
            return this._criteriaDivider;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "criteria", {
        get: function () {
            return new CriteriaBuilder(this);
        },
        enumerable: true,
        configurable: true
    });
    Table.prototype.on = function (evtType, callback) {
        this.connection.watch(this.name, evtType, callback);
    };
    Table.prototype.off = function (evtType, callbackToRemove) {
        this.connection.unwatch(this.name, evtType, callbackToRemove);
    };
    Table.prototype.has = function (extendedFunctionName) {
        return this[extendedFunctionName] !== undefined;
    };
    Table.prototype.extend = function (functionName, theFunction) {
        var isFunction = !!(theFunction && theFunction.constructor && theFunction.call && theFunction.apply);
        if (isFunction) {
            this[functionName] = theFunction;
        }
    };
    Table.prototype.objectFromRow = function (row) {
        var _this = this;
        var obj = {};
        Helper.forEachKey(row, function (key) {
            if (_this.columns.indexOf(key) !== -1 || _this.primaryKey === key) {
                obj[Helper.toObjectProperty(key)] = row[key];
            }
            else {
                obj[key] = row[key];
            }
        });
        return obj;
    };
    Table.prototype.rowFromObject = function (obj) {
        var _this = this;
        var row = {};
        Helper.forEachKey(obj, function (key) {
            var rowKey = Helper.toRowProperty(key);
            if (_this.columns.indexOf(rowKey) !== -1 || _this.primaryKey === rowKey) {
                row[rowKey] = obj[key];
            }
        });
        return row;
    };
    Table.prototype.getRowAsArray = function (jsObject) {
        var _this = this;
        var _arr = new Array();
        var _columns = [];
        var _values = [];
        Helper.forEachKey(jsObject, function (key) {
            var _col = Helper.toRowProperty(key);
            if (_this.columns.indexOf(_col) !== -1) {
                _columns.push(_col);
                _values.push(jsObject[key]);
            }
        });
        _arr.push(_columns);
        _arr.push(_values);
        return _arr;
    };
    Table.prototype.getPrimaryKeyValue = function (jsObject) {
        var returnValue = 0;
        var primaryKeyObjectProperty = Helper.toObjectProperty(this.primaryKey);
        if (jsObject) {
            if (jsObject.constructor === Array) {
            }
            else if (Helper.isString(jsObject) || Helper.isNumber(jsObject)) {
                return jsObject;
            }
            else {
                if (jsObject.hasOwnProperty(primaryKeyObjectProperty) || jsObject[primaryKeyObjectProperty] !== undefined) {
                    returnValue = jsObject[primaryKeyObjectProperty];
                }
                else {
                    returnValue = 0;
                }
            }
        }
        return returnValue;
    };
    Table.prototype.find = function (criteriaRawJsObject, callback) {
        return this._selectQuery.execute(criteriaRawJsObject, callback);
    };
    Table.prototype.findSingle = function (criteriaRawJsObject, callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.find(criteriaRawJsObject).then(function (results) {
                resolve(results[0]);
                if (callback) {
                    callback(results[0]);
                }
            });
        });
    };
    Table.prototype.findOne = function (criteriaRawJsObject, callback) {
        return this.findSingle(criteriaRawJsObject, callback);
    };
    Table.prototype.findById = function (id, callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var criteria = {};
            criteria[_this.primaryKey] = "= " + id;
            _this.find(criteria).then(function (results) {
                resolve(results[0]);
                if (callback) {
                    callback(results[0]);
                }
            }).catch(function (err) { return reject(err); });
        });
    };
    Table.prototype.findAll = function (tableRules, callback) {
        var _obj = {};
        if (tableRules !== undefined) {
            _obj[SelectQueryRules.TABLE_RULES_PROPERTY] = tableRules;
        }
        return this.find(_obj, callback);
    };
    Table.prototype.save = function (criteriaRawJsObject, callback) {
        return this._saveQuery.execute(criteriaRawJsObject, callback);
    };
    Table.prototype.remove = function (criteriaOrID, callback) {
        return this._deleteQuery.execute(criteriaOrID, callback);
    };
    return Table;
})();
