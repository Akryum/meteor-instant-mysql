

var CollectionChangedAction = {};
(function (CollectionChangedAction) {
    CollectionChangedAction[CollectionChangedAction["INSERT"] = 0] = "INSERT";
    CollectionChangedAction[CollectionChangedAction["DELETE"] = 1] = "DELETE";
    CollectionChangedAction[CollectionChangedAction["RESET"] = 2] = "RESET";
})(CollectionChangedAction);
var CollectionChangedEventArgs = (function () {
    function CollectionChangedEventArgs(action, oldItems, newItems, oldStartingIndex, newStartingIndex) {
        if (oldItems === void 0) { oldItems = []; }
        if (newItems === void 0) { newItems = []; }
        if (oldStartingIndex === void 0) { oldStartingIndex = -1; }
        if (newStartingIndex === void 0) { newStartingIndex = -1; }
        this.action = action;
        this.oldItems = oldItems;
        this.newItems = newItems;
        this.oldStartingIndex = oldStartingIndex;
        this.newStartingIndex = newStartingIndex;
    }
    return CollectionChangedEventArgs;
})();
BaseCollection = (function () {
    function BaseCollection(table) {
        this.table = table;
        this.list = [];
        this.listeners = [];
    }
    Object.defineProperty(BaseCollection.prototype, "length", {
        get: function () {
            return this.list.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseCollection.prototype, "isObservable", {
        get: function () {
            return this.listeners.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseCollection.prototype, "items", {
        get: function () {
            return this.list;
        },
        enumerable: true,
        configurable: true
    });
    BaseCollection.prototype.indexOf = function (item) {
        for (var i = 0; i < this.list.length; i++) {
            var _itemIn = this.list[i];
            var _primaryKey = Helper.toObjectProperty(this.table.primaryKey);
            if (Helper.isString(item) || Helper.isNumber(item)) {
                if (item === _itemIn[_primaryKey]) {
                    return i;
                }
            }
            else {
                var _primarykeyVal = void 0;
                if (item[ObservableObject.RESERVED_PROPERTY_NAMES[0]] !== undefined) {
                    _primarykeyVal = item["_" + _primaryKey];
                }
                else {
                    _primarykeyVal = item[_primaryKey];
                }
                if (_primarykeyVal === _itemIn[_primaryKey]) {
                    return i;
                }
            }
        }
        return -1;
    };
    BaseCollection.prototype.findItem = function (itemId) {
        for (var i = 0; i < this.list.length; i++) {
            var _itemIn = this.list[i];
            if (!_itemIn) {
                continue;
            }
            var _primaryKey = Helper.toObjectProperty(this.table.primaryKey);
            if (itemId === _itemIn[_primaryKey]) {
                return _itemIn;
            }
        }
        return undefined;
    };
    BaseCollection.prototype.getItem = function (index) {
        return this.list[index];
    };
    BaseCollection.prototype.getItemObservable = function (index) {
        var item = this.getItem(index);
        if (item[ObservableObject.RESERVED_PROPERTY_NAMES[0]] !== undefined) {
            return item;
        }
        else {
            return new ObservableObject(item);
        }
    };
    BaseCollection.prototype.addItem = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments[_i];
        }
        var startingIndex = this.list.length === 0 ? 1 : this.list.length;
        var evtArgs = new CollectionChangedEventArgs(CollectionChangedAction.INSERT);
        evtArgs.newStartingIndex = startingIndex;
        var newItemPushed;
        items.forEach(function (item) {
            _this.list.push(item);
        });
        evtArgs.newItems = this.list;
        this.notifyCollectionChanged(evtArgs);
        return newItemPushed;
    };
    BaseCollection.prototype.removeItem = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments[_i];
        }
        var startingIndex = this.indexOf(items[0]);
        if (startingIndex >= 0) {
            var evtArgs = new CollectionChangedEventArgs(CollectionChangedAction.DELETE);
            evtArgs.oldStartingIndex = startingIndex;
            items.forEach(function (item) {
                var _index = _this.indexOf(item);
                var itemWhichDeleted = _this.list[_index];
                evtArgs.oldItems.push(itemWhichDeleted);
                _this.list.splice(_index, 1);
                evtArgs.newItems = _this.list;
            });
            this.notifyCollectionChanged(evtArgs);
        }
        return this;
    };
    BaseCollection.prototype.removeItemById = function (id) {
        var _indexToRemove = -1;
        var _primaryKey = Helper.toObjectProperty(this.table.primaryKey);
        this.list.some(function (item, index) {
            if (item["_" + _primaryKey] === id || item[_primaryKey] === id) {
                _indexToRemove = index;
                return true;
            }
            else {
                return false;
            }
        });
        if (_indexToRemove >= 0) {
            var evtArgs = new CollectionChangedEventArgs(CollectionChangedAction.DELETE);
            evtArgs.oldStartingIndex = _indexToRemove;
            evtArgs.oldItems = [this.list[_indexToRemove]];
            this.list.splice(_indexToRemove, 1);
            evtArgs.newItems = this.list;
            this.notifyCollectionChanged(evtArgs);
        }
        return this;
    };
    BaseCollection.prototype.forgetItem = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments[_i];
        }
        if (items === undefined || items.length === 0) {
            this.listeners = [];
            this.list = [];
        }
        else {
            items.forEach(function (item) {
                _this.list.splice(_this.indexOf(item), 1);
            });
        }
        return this;
    };
    BaseCollection.prototype.reset = function () {
        var startingIndex = this.list.length - 1;
        var evtArgs = new CollectionChangedEventArgs(CollectionChangedAction.RESET);
        evtArgs.oldStartingIndex = startingIndex;
        evtArgs.oldItems = this.list.slice(0);
        this.list = [];
        evtArgs.newItems = this.list;
        this.notifyCollectionChanged(evtArgs);
        return this;
    };
    BaseCollection.prototype.notifyCollectionChanged = function (evtArgs) {
        this.listeners.forEach(function (listener) {
            listener(evtArgs);
        });
    };
    BaseCollection.prototype.onCollectionChanged = function (callback) {
        this.listeners.push(callback);
    };
    return BaseCollection;
})();
BaseCollection.CollectionChangedAction = CollectionChangedAction;
BaseCollection.CollectionChangedEventArgs = CollectionChangedEventArgs;