ObservableCollection = (function () {
    function ObservableCollection(table, fetchAllFromDatabase, callbackWhenReady) {
        var _this = this;
        this.table = table;
        this.local = new BaseCollection(table);
        if (fetchAllFromDatabase) {
            this.table.findAll().then(function (resultObjects) {
                resultObjects.forEach(function (obj) {
                    var observableObj = new ObservableObject(obj);
                    _this.local.items.push(observableObj);
                });
                _this.startListeningToDatabase();
                if (callbackWhenReady) {
                    callbackWhenReady();
                }
            });
        }
        else {
            this.startListeningToDatabase();
            if (callbackWhenReady) {
                callbackWhenReady();
            }
        }
    }
    Object.defineProperty(ObservableCollection.prototype, "items", {
        get: function () {
            return this.local.items;
        },
        enumerable: true,
        configurable: true
    });
    ObservableCollection.prototype.onCollectionChanged = function (callback) {
        this.local.onCollectionChanged(callback);
    };
    ObservableCollection.prototype.startListeningToDatabase = function () {
        var _this = this;
        this.table.on("INSERT", function (rows) {
            rows.forEach(function (row) {
                var _newPureItem = _this.table.objectFromRow(row);
                var _newObservableItem = new ObservableObject(_newPureItem);
                _this.local.addItem(_newObservableItem);
            });
        });
        this.table.on("UPDATE", function (rows) {
            rows.forEach(function (row) {
                var rowUpdated = row["after"];
                var existingItem = _this.local.findItem(rowUpdated[_this.table.primaryKey]);
                if (existingItem !== undefined) {
                    var objRow = _this.table.objectFromRow(rowUpdated);
                    Helper.forEachKey(objRow, function (key) {
                        if (objRow[key] !== existingItem[key]) {
                            existingItem[key] = objRow[key];
                        }
                    });
                }
            });
        });
        this.table.on("DELETE", function (rows) {
            rows.forEach(function (row) {
                _this.local.removeItemById(row[_this.table.primaryKey]);
            });
        });
    };
    ObservableCollection.prototype.find = function (criteriaRawJsObject, callback) {
        return this.table.find(criteriaRawJsObject, callback);
    };
    ObservableCollection.prototype.findOne = function (criteriaRawJsObject, callback) {
        return this.table.findOne(criteriaRawJsObject, callback);
    };
    ObservableCollection.prototype.findById = function (id, callback) {
        return this.table.findById(id, callback);
    };
    ObservableCollection.prototype.findAll = function (tableRules, callback) {
        return this.table.findAll(tableRules, callback);
    };
    ObservableCollection.prototype.insert = function (criteriaRawJsObject, callback) {
        return this.table.save(criteriaRawJsObject, callback);
    };
    ObservableCollection.prototype.update = function (criteriaRawJsObject, callback) {
        return this.table.save(criteriaRawJsObject, callback);
    };
    ObservableCollection.prototype.save = function (criteriaRawJsObject, callback) {
        return this.table.save(criteriaRawJsObject, callback);
    };
    ObservableCollection.prototype.remove = function (criteriaOrID, callback) {
        return this.table.remove(criteriaOrID, callback);
    };
    ObservableCollection.prototype.delete = function (criteriaOrID, callback) {
        return this.remove(criteriaOrID, callback);
    };
    return ObservableCollection;
})();
