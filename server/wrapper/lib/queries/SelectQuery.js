var Promise = Npm.require('bluebird');
const EQUAL_TO_PROPERTY_SYMBOL = '= ';
SelectQuery = (function () {
    function SelectQuery(_table) {
        this._table = _table;
    }
    SelectQuery.prototype.parseQueryResult = function (result, criteria) {
        var _this = this;
        return new Promise(function (resolve) {
            var obj = _this._table.objectFromRow(result);
            if (criteria.tables.length > 0) {
                var tableFindPromiseList = [];
                criteria.tables.forEach(function (_tableProperty) {
                    var table = _this._table.connection.table(_tableProperty.tableName);
                    var tablePropertyName = Helper.toObjectProperty(_tableProperty.propertyName);
                    var criteriaJsObject = Helper.copyObject(criteria.rawCriteriaObject[tablePropertyName]);
                    Helper.forEachKey(criteriaJsObject, function (propertyName) {
                        if (Helper.isString(criteriaJsObject[propertyName])) {
                            var propValueToCheck = criteriaJsObject[propertyName];
                            var indexOfEquality = propValueToCheck.indexOf(EQUAL_TO_PROPERTY_SYMBOL);
                            if (indexOfEquality === 0) {
                                if (propValueToCheck.length === EQUAL_TO_PROPERTY_SYMBOL.length) {
                                    criteriaJsObject[propertyName] = result[Helper.toRowProperty(propertyName)];
                                }
                                else {
                                    criteriaJsObject[propertyName] = result[Helper.toRowProperty(propValueToCheck.substring(EQUAL_TO_PROPERTY_SYMBOL.length))];
                                }
                            }
                        }
                    });
                    var tableFindPromise = table.find(criteriaJsObject);
                    tableFindPromise.then(function (childResults) {
                        if (childResults.length === 1 &&
                            Helper.hasRules(criteriaJsObject) && ((criteriaJsObject[SelectQueryRules.TABLE_RULES_PROPERTY].limit !== undefined && criteriaJsObject[SelectQueryRules.TABLE_RULES_PROPERTY].limit === 1) ||
                            (criteriaJsObject[SelectQueryRules.TABLE_RULES_PROPERTY].limitEnd !== undefined && criteriaJsObject[SelectQueryRules.TABLE_RULES_PROPERTY].limitEnd === 1))) {
                            obj[tablePropertyName] = _this._table.objectFromRow(childResults[0]);
                        }
                        else {
                            obj[tablePropertyName] = [];
                            childResults.forEach(function (childResult) {
                                obj[tablePropertyName].push(_this._table.objectFromRow(childResult));
                            });
                        }
                    });
                    tableFindPromiseList.push(tableFindPromise);
                });
                Promise.all(tableFindPromiseList).then(function () {
                    resolve(obj);
                });
            }
            else {
                resolve(obj);
            }
        });
    };
    SelectQuery.prototype.promise = function (rawCriteriaObject, callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var rawCriteria;
            if (rawCriteriaObject instanceof CriteriaBuilder) {
                rawCriteria = rawCriteriaObject.build();
            }
            else {
                rawCriteria = rawCriteriaObject;
            }
            var criteria = _this._table.criteriaDivider.divide(rawCriteria);
            var query = "SELECT " + criteria.selectFromClause(_this._table) + " FROM " + _this._table.name + criteria.whereClause + criteria.queryRules.toString();
            _this._table.connection.query(query, function (error, results) {
                if (error || !results) {
                    reject(error + ' Error. On find');
                }
                var parseQueryResultsPromises = [];
                results.forEach(function (result) {
                    parseQueryResultsPromises.push(_this.parseQueryResult(result, criteria));
                });
                Promise.all(parseQueryResultsPromises).then(function (_objects) {
                    if (callback !== undefined) {
                        callback(_objects);
                    }
                    resolve(_objects);
                });
            });
        });
    };
    SelectQuery.prototype.execute = function (rawCriteria, callback) {
        return this.promise(rawCriteria);
    };
    return SelectQuery;
})();
SelectQuery.EQUAL_TO_PROPERTY_SYMBOL = EQUAL_TO_PROPERTY_SYMBOL;