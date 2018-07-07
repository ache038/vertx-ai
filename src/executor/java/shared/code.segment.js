const Ux = require('../../../epic');
const Split = require('./code.split');
const writePackage = (lines, name) => {
    if (lines) {
        const line = `package ${name};`;
        lines.push(line);
    }
};
const writeBody = (lines, name, isClazz) => {
    let line = '';
    if (isClazz) {
        line = `public class ${name} {`;
    } else {
        line = `public interface ${name} {`;
    }
    lines.push(line);
    lines.push('}');
};
const writeInterfaceVariable = (lines, meta = {}, indent = 1) => {
    if (meta.name && meta.type && meta.value) {
        let line = '';
        for (let idx = 0; idx < indent; idx++) {
            line += `    `;
        }
        meta.value = Split.parseLiteral(meta.value, meta.type);
        line += `${meta.type} ${meta.name} = ${meta.value};`;
        lines.push(line);
    }
};
const writeImportLine = (lines, clazz) => {
    if (clazz) {
        const result = lines.filter(item => 0 <= item.indexOf(clazz));
        if (0 === result.length) {
            lines.push(`import ${clazz};`);
        }
    }
};
const writeAnnotation = (lines, line) => {
    if (line) {
        const result = lines.filter(item => 0 <= item.indexOf(line));
        if (0 === result.length) {
            lines.push(line);
        }
    }
};
const writeParamAnno = (param = {}, reference) => {
    if ("JsonObject" !== param.type) {
        if (param.annotation) {
            return `@${param.annotation}("${param.name}")`;
        } else {
            reference.addImport('javax.ws.rs.QueryParam');
            return `@QueryParam("${param.name}")`;
        }
    } else {
        reference.addImport('io.vertx.up.annotations.Codex');
        reference.addImport('javax.ws.rs.BodyParam');
        return `@BodyParam @Codex`;
    }
};
const writeParams = (params = [], ws = false, reference) => {
    let content = "";
    const parameters = [];
    params.forEach(param => {
        let anno = "";
        anno += (param.type + ' ' + param.name);
        if (ws) {
            anno = writeParamAnno(param, reference) + ' ' + anno;
        }
        Ux.info(`--> 方法参数设置：${param.name}, = ${anno}`);
        anno = '        ' + anno;
        parameters.push(anno);
    });
    for (let idx = 0; idx < parameters.length; idx++) {
        content += '\n' + parameters[idx];
        if (idx < parameters.length - 1) {
            content += ',';
        }
    }
    return content;
};
const writeMethod = (lines, method, annotations = [], reference) => {
    // 方法添加
    let content = "    ";
    content += method.returnValue;
    Ux.info(`-> 方法：${method.name}`.blue);
    content += ' ' + method.name + '(';
    // 参数表生成
    content += writeParams(method.params, method.ws, reference);
    content += ')';
    // 叠加
    let all = "";
    annotations.forEach(annotation => all += `    ${annotation}\n`);
    all += content;
    all += ';\n';
    lines.push(all);
};
module.exports = {
    writePackage,
    writeBody,
    writeInterfaceVariable,
    writeImportLine,
    writeAnnotation,
    writeMethod
};