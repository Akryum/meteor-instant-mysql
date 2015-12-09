var PropertyChangedArgs = (function () {
    function PropertyChangedArgs(propertyName, oldValue) {
        this.propertyName = propertyName;
        this.oldValue = oldValue;
    }
    return PropertyChangedArgs;
})();
ObservableObject = (function () {
    function ObservableObject(obj) {
        if (obj) {
            this.makeObservable(obj);
        }
    }
    ObservableObject.prototype.makeObservable = function (obj) {
        var _this = this;
        for (var key in obj) {
            this["_" + key] = obj[key];
        }
        Helper.forEachKey(this, function (key) {
            var propertyName = key["substr"](1);
            if (ObservableObject.RESERVED_PROPERTY_NAMES.indexOf(propertyName) === -1) {
                Object.defineProperty(ObservableObject.prototype, propertyName, {
                    get: function () {
                        return _this[key];
                    },
                    set: function (_value) {
                        if (_value !== undefined && _this[key] !== _value) {
                            var oldValue = _this[key];
                            _this[key] = _value;
                            _this.notifyPropertyChanged(propertyName, oldValue);
                        }
                    },
                    enumerable: false,
                    configurable: true
                });
            }
        });
    };
    ObservableObject.prototype.onPropertyChanged = function (listener) {
        if (!this.propertyChangedListeners)
            this.propertyChangedListeners = [];
        this.propertyChangedListeners.push(listener);
    };
    ObservableObject.prototype._forget = function () {
        this.propertyChangedListeners = [];
    };
    ObservableObject.prototype.notifyPropertyChanged = function (propertyName, oldValue) {
        if (this.propertyChangedListeners && this.propertyChangedListeners.length > 0) {
            for (var i = 0; i < this.propertyChangedListeners.length; i++) {
                this.propertyChangedListeners[i](new PropertyChangedArgs(propertyName, oldValue));
            }
        }
    };
    ObservableObject.prototype.toJSON = function () {
        var _this = this;
        var excludeProperties = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            excludeProperties[_i] = arguments[_i];
        }
        var rawObject = {};
        Helper.forEachKey(this, function (_key) {
            var key = Helper.toObjectProperty(_key.substr(1));
            if (ObservableObject.RESERVED_PROPERTY_NAMES.indexOf(key) == -1) {
                if (key !== SelectQueryRules.TABLE_RULES_PROPERTY && excludeProperties.indexOf(key) == -1) {
                    rawObject[key] = _this[_key];
                }
            }
        });
        return rawObject;
    };
    ObservableObject.RESERVED_PROPERTY_NAMES = ["propertyChangedListeners", "notifyPropertyChanged", "onPropertyChanged", "toJSON", "makeObservable", "_forget"];
    return ObservableObject;
})();
ObservableObject.PropertyChangedArgs = PropertyChangedArgs;
