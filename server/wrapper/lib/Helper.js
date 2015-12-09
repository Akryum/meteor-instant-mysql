Helper = (function () {
    function Helper() {
    }
    Helper.escapeRegExp = function (string) {
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    };
    Helper.replaceAll = function (string, find, replace) {
        return string.replace(new RegExp(Helper.escapeRegExp(find), 'g'), replace);
    };
    Helper.copyObject = function (object) {
        var objectCopy = {};
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                objectCopy[key] = object[key];
            }
        }
        return objectCopy;
    };
    Helper.toObjectProperty = function (columnKey) {
        return columnKey;
    };
    Helper.toRowProperty = function (objectKey) {
        return objectKey;
    };
    Helper.forEachValue = function (map, callback) {
        var result;
        for (var id in map) {
            if ((result = callback(map[id])))
                break;
        }
        return result;
    };
    Helper.forEachKey = function (map, callback) {
        var result;
        for (var id in map) {
            if ((result = callback(id)))
                break;
        }
        return result;
    };
    Helper.isFunction = function (functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    };
    Helper.isString = function (something) {
        return typeof something === 'string' || something instanceof String;
    };
    Helper.isNumber = function (something) {
        return !isNaN(something - 0) && something !== null && something !== "" && something !== false;
    };
    Helper.hasRules = function (obj) {
        return obj !== undefined && obj[SelectQueryRules.TABLE_RULES_PROPERTY] !== undefined;
    };
    Helper.extendTypes = function (first, second) {
        var result = {};
        for (var id in first) {
            result[id] = first[id];
        }
        for (var id in second) {
            if (!result.hasOwnProperty(id)) {
                result[id] = second[id];
            }
        }
        return result;
    };
    return Helper;
})();
