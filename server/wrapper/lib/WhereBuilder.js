
WhereBuilder = (function () {
    function WhereBuilder(parentCriteriaBuilder, key) {
        this.parentCriteriaBuilder = parentCriteriaBuilder;
        this.key = key;
    }
    WhereBuilder.prototype.eq = function (val) {
        this.parentCriteriaBuilder.rawCriteria[this.key] = "= " + val;
        return this.parentCriteriaBuilder;
    };
    WhereBuilder.prototype.ne = function (val) {
        this.parentCriteriaBuilder.rawCriteria[this.key] = "<> " + val;
        return this.parentCriteriaBuilder;
    };
    WhereBuilder.prototype.gt = function (val) {
        this.parentCriteriaBuilder.rawCriteria[this.key] = "> " + val;
        return this.parentCriteriaBuilder;
    };
    WhereBuilder.prototype.lt = function (val) {
        this.parentCriteriaBuilder.rawCriteria[this.key] = "< " + val;
        return this.parentCriteriaBuilder;
    };
    WhereBuilder.prototype.ge = function (val) {
        this.parentCriteriaBuilder.rawCriteria[this.key] = ">= " + val;
        return this.parentCriteriaBuilder;
    };
    WhereBuilder.prototype.le = function (val) {
        this.parentCriteriaBuilder.rawCriteria[this.key] = "<= " + val;
        return this.parentCriteriaBuilder;
    };
    WhereBuilder.prototype.in = function (values) {
        this.parentCriteriaBuilder.rawCriteria[this.key] = "IN( " + values.join(", ") + ") ";
        return this.parentCriteriaBuilder;
    };
    return WhereBuilder;
})();
WhereBuilder.COMPARISON_SYMBOLS = ["= ", "<> ", "> ", "< ", ">= ", "<= "];