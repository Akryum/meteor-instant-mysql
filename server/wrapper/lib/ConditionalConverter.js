ConditionalConverter = (function () {
    function ConditionalConverter() {
    }
    ConditionalConverter.toMysql = function (_symbol) {
        _symbol = _symbol.replace(/\s/g, "");
        switch (_symbol) {
            case "===":
                return "=";
                break;
            case "!==":
                return "<>";
                break;
            default:
                return _symbol;
                break;
        }
    };
    ConditionalConverter.toJS = function (_symbol) {
        _symbol = _symbol.replace(/\s/g, "");
        switch (_symbol) {
            case "=":
                return "===";
                break;
            case "<>":
                return "!==";
                break;
            default:
                return _symbol;
                break;
        }
    };
    ConditionalConverter.toMysqlConditional = function (ifevalStatement) {
        var where = Helper.replaceAll(ifevalStatement, "===", "=");
        where = Helper.replaceAll(ifevalStatement, "!==", "<>");
        where = Helper.replaceAll(ifevalStatement, "&&", " and ");
        where = Helper.replaceAll(ifevalStatement, "||", " or ");
        return where;
    };
    ConditionalConverter.toJSConditional = function (whereStatementConditional) {
        var ifEval = Helper.replaceAll(whereStatementConditional, "=", "===");
        ifEval = Helper.replaceAll(whereStatementConditional, "<>", "!==");
        ifEval = Helper.replaceAll(whereStatementConditional, "!=", "!==");
        ifEval = Helper.replaceAll(whereStatementConditional, " and ", " && ");
        ifEval = Helper.replaceAll(whereStatementConditional, " AND ", " && ");
        ifEval = Helper.replaceAll(whereStatementConditional, " or ", " || ");
        ifEval = Helper.replaceAll(whereStatementConditional, "  OR  ", " || ");
        return ifEval;
    };
    return ConditionalConverter;
})();
