CriteriaBuilder = (function () {
    function CriteriaBuilder(primaryTable, tablePropertyName, parentBuilder) {
        this.primaryTable = primaryTable;
        this.tablePropertyName = tablePropertyName;
        this.parentBuilder = parentBuilder;
        this.rawCriteria = {};
        if (parentBuilder !== undefined) {
            this.rawCriteria = parentBuilder.rawCriteria[tablePropertyName];
        }
    }
    CriteriaBuilder.prototype.where = function (key) {
        this.lastWhereBuilderUsed = new WhereBuilder(this, key);
        return this.lastWhereBuilderUsed;
    };
    CriteriaBuilder.prototype.or = function (key) {
        if (key === undefined && this.lastWhereBuilderUsed === undefined) {
            console.error('CriteriaBuilder or: PLEASE SPECIFY KEY');
            return;
        }
        if (key !== undefined && key.indexOf("or ") >= 0) {
        }
        else if (key === undefined && this.lastWhereBuilderUsed.key.indexOf("or ") >= 0) {
            key = this.lastWhereBuilderUsed.key;
        }
        else if (key === undefined) {
            key = "or " + this.lastWhereBuilderUsed.key;
        }
        else {
            key = "or " + key;
        }
        return this.where(key);
    };
    CriteriaBuilder.prototype.createRulesIfNotExists = function () {
        if (!Helper.hasRules(this.rawCriteria)) {
            this.rawCriteria[SelectQueryRules.TABLE_RULES_PROPERTY] = {};
        }
    };
    CriteriaBuilder.prototype.except = function () {
        var columns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            columns[_i - 0] = arguments[_i];
        }
        if (columns !== undefined) {
            this.createRulesIfNotExists();
            this.rawCriteria[SelectQueryRules.TABLE_RULES_PROPERTY]["except"] = columns;
        }
        return this;
    };
    CriteriaBuilder.prototype.exclude = function () {
        var columns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            columns[_i - 0] = arguments[_i];
        }
        return this.except(columns.toString());
    };
    CriteriaBuilder.prototype.orderBy = function (column, desceding) {
        if (desceding === void 0) { desceding = false; }
        this.createRulesIfNotExists();
        this.rawCriteria[SelectQueryRules.TABLE_RULES_PROPERTY]["orderBy" + (desceding ? "Desc" : "")] = column;
        return this;
    };
    CriteriaBuilder.prototype.limit = function (start, end) {
        this.createRulesIfNotExists();
        if (end !== undefined && end > start) {
            this.rawCriteria[SelectQueryRules.TABLE_RULES_PROPERTY]["limitStart"] = start;
            this.rawCriteria[SelectQueryRules.TABLE_RULES_PROPERTY]["limitEnd"] = end;
        }
        else {
            this.rawCriteria[SelectQueryRules.TABLE_RULES_PROPERTY]["limit"] = start;
        }
        return this;
    };
    CriteriaBuilder.prototype.join = function (realTableName, foreignColumnName, thisColumnName) {
        var _joinedTable = {};
        _joinedTable[foreignColumnName] = SelectQuery.EQUAL_TO_PROPERTY_SYMBOL + (thisColumnName ? thisColumnName : '');
        _joinedTable[SelectQueryRules.TABLE_RULES_PROPERTY] = { table: realTableName };
        this.rawCriteria[realTableName] = _joinedTable;
        return this;
    };
    CriteriaBuilder.prototype.joinAs = function (tableNameProperty, realTableName, foreignColumnName, thisColumnName) {
        var _joinedTable = {};
        _joinedTable[foreignColumnName] = SelectQuery.EQUAL_TO_PROPERTY_SYMBOL + (thisColumnName ? thisColumnName : '');
        _joinedTable[SelectQueryRules.TABLE_RULES_PROPERTY] = { table: realTableName };
        this.rawCriteria[tableNameProperty] = _joinedTable;
        return this;
    };
    CriteriaBuilder.prototype.at = function (tableNameProperty) {
        return new CriteriaBuilder(this.primaryTable, tableNameProperty, this);
    };
    CriteriaBuilder.prototype.parent = function () {
        this.parentBuilder.rawCriteria[this.tablePropertyName] = this.rawCriteria;
        return this.parentBuilder;
    };
    CriteriaBuilder.prototype.original = function () {
        if (this.parentBuilder !== undefined) {
            return this.parent().original();
        }
        else {
            return this;
        }
    };
    CriteriaBuilder.prototype.build = function () {
        if (this.parentBuilder !== undefined) {
            return this.parent().build();
        }
        else {
            return this.rawCriteria;
        }
    };
    CriteriaBuilder.from = function (table) {
        return new CriteriaBuilder(table);
    };
    return CriteriaBuilder;
})();
