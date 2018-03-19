// Fusion Grammar
// ==========================

{
  function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return mergeDeep(target, ...sources);
  }
}

Root
  = defs:(Include / Definition / Comment)* {
    return defs.reduce(function(result, def) {
     	mergeDeep(result, def);
        return result;
    }, {});
  }

Comment
  = LineComment / BlockComment {
    return {};
  }

LineComment
  = _ "#" [^\n]* _

BlockComment
  = _ "/*" (!"*/" .)* "*/" _

Include
  = _ "include:" _ pattern:(StringLiteral / FilePattern) _ {
    return {
      "__includes": {
        [pattern]: {}
      }
    };
  }

FilePattern
  = [a-zA-Z.*/_-]+ {
    return text();
  }

Definitions
  = defs:((Definition / Comment)*) {
    return defs.reduce(function(result, def) {
     	mergeDeep(result, def);
        return result;
    }, {});
  }

Definition
  = _ def:(PropertyBlock / PropertyDefinition) _ {
    return def;
  }

PropertyBlock
  = path:PropertyPath _ "{" _ defs:Definitions _ "}" {
    var result = {}, cur = result;
    path.forEach(function(p) {
    	cur = cur[p] = {};
    });
    Object.assign(cur, defs);
    // cur['__pos'] = location();
    return result;
  }

PropertyDefinition
  = path:PropertyPath _ "=" _ def:(ExpressionLiteral / SimpleValue / Object) {
    var result = {}, cur = result;
    path.forEach(function(p) {
    	cur = cur[p] = {};
    });
    Object.assign(cur, def);
    // cur['__pos'] = location();
    return result;
  }

PropertyPath
  = head:PropertyPathPart tail:("." PropertyPathPart)* {
      return [head].concat(
        // Skip the dot
        tail.map(function(el) { return el[1]; })
      ).reduce(function(result, path) {
        return result.concat(path);
      }, []);
    }

PropertyPathPart
  = PrototypeName / PropertyName

SimpleValue
  = lit:Literal { return { "__value": lit } }

Literal "literal"
  = BooleanLiteral / NumberLiteral / StringLiteral

Object
  = name:ObjectName { return { "__objectName": name }; }

ObjectName
  = [a-zA-Z0-9.:]+ { return text(); }

PropertyName
  = name:(PropertyNameLiteral / StringLiteral) { return [name]; }

PropertyNameLiteral
  = "@"? [a-zA-Z0-9:_\-]+ { return text(); }

PrototypeName
  = "prototype(" _ name:ObjectName _ ")" {
    return ["__prototypes", name];
  }

ExpressionLiteral
  = "${" _ exp:Eel_Expression _ "}" { return { "__expression": exp }; }

_IntegerNumber
  = "-"? [0-9]+
_Decimals
  = "." [0-9]+
NumberLiteral
  = int:_IntegerNumber dec:_Decimals? {
    return parseFloat(text(), 10);
  }

BooleanLiteral "bool"
  = ("false" / "true" / "FALSE" / "TRUE") {
    return text().toLowerCase() === 'true';
  }

DoubleQuotedStringLiteral
  = '"' ('\\"'/[^"])* '"' {
    const s = text();
    return s.substr(1, s.length - 2).replace('\\"', '"');
  }
SingleQuotedStringLiteral
  = "'" ("\\'"/[^'])* "'" {
    const s = text();
    return s.substr(1, s.length - 2).replace('\\\'', '\'');
  }
StringLiteral "string"
  = SingleQuotedStringLiteral / DoubleQuotedStringLiteral

// BasicTypes
Eel_Identifier
  = [a-zA-Z_] [a-zA-Z0-9_-]*
Eel_OffsetAccess
  = '[' _ Eel_Expression _ ']'
Eel_MethodCall
  = Eel_Identifier '(' _ Eel_Expression? _ (',' _ Eel_Expression _ )* ')'
Eel_ObjectPath
  = (Eel_MethodCall / Eel_Identifier) ('.' (Eel_MethodCall / Eel_Identifier) / Eel_OffsetAccess)*
Eel_Term
  = BooleanLiteral !Eel_Identifier / NumberLiteral / StringLiteral / Eel_ObjectPath

// CombinedExpressions
Eel_Expression
  = Eel_ConditionalExpression {
    return text();
  }
Eel_SimpleExpression
  = Eel_WrappedExpression / Eel_NotExpression / Eel_ArrayLiteral / Eel_ObjectLiteral / Eel_Term
Eel_WrappedExpression
  = '(' _ Eel_Expression _ ')'
Eel_NotExpression
  = ("!" / "not" __) _ Eel_SimpleExpression
Eel_ConditionalExpression
  = Eel_Disjunction (_ '?' _ Eel_Expression _ ':' _ Eel_Expression)?
Eel_Disjunction
  = Eel_Conjunction (_ ("||" / "or" __) _ Eel_Conjunction)*
Eel_Conjunction
  = Eel_Comparison ( _ ("&&" / "and" __) _ Eel_Comparison)*
Eel_Comparison
  = Eel_SumCalculation (_ ("==" / "!=" / "<=" / ">=" / "<" / ">") _ Eel_SumCalculation)?
Eel_SumCalculation
  = Eel_ProdCalculation (_ ("+" / "-") _ Eel_ProdCalculation)*
Eel_ProdCalculation
  = Eel_SimpleExpression (_ ("/" / "*" / "%") _ Eel_SimpleExpression)*
Eel_ArrayLiteral
  = '[' _ Eel_Expression? (_ ',' _ Eel_Expression)* _ ']'
Eel_ObjectLiteralProperty
  = (StringLiteral / Eel_Identifier) _ ':' _ Eel_Expression
Eel_ObjectLiteral
  = '{' _ Eel_ObjectLiteralProperty? (_ ',' _ Eel_ObjectLiteralProperty)* _ '}'

// Optional and required whitespace

_ "whitespace"
  = [ \t\n\r]*

__ "required whitespace"
  = [ \t\n\r]+