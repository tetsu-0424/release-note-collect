"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var child_process_1 = require("child_process");
var util_1 = require("util");
var cheerio = require("cheerio"); // `cheerio` を追加
var iconv = require("iconv-lite");
// import { pullOutContents_Jtest, pullOutContents_Redhat, pullOutContents_Renorex, pullOutContents_Subversion } from "./logics/htmlPullOut";
var execPromise = (0, util_1.promisify)(child_process_1.exec);
// ファイルを読み込んでリンクを取得
var getFileLinkList = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fs.readFileSync("./links/".concat(filePath, ".txt"), "utf-8")];
            case 1:
                data = _a.sent();
                return [2 /*return*/, data
                        .split("\n")
                        .map(function (line) { return line.trim(); })
                        .filter(function (line) { return line.startsWith("http"); })];
            case 2:
                error_1 = _a.sent();
                console.error("ファイルの読み込みに失敗しました:", error_1);
                return [2 /*return*/, []];
            case 3: return [2 /*return*/];
        }
    });
}); };
var fetchHtml = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var html, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, execPromise("curl -A \"Mozilla/5.0\" -L ".concat(url), { maxBuffer: 1024 * 1024 * 10 })];
            case 1:
                html = (_a.sent()).stdout;
                // console.log(html);
                return [2 /*return*/, html];
            case 2:
                error_2 = _a.sent();
                console.error("html取得時にエラーが発生しました。");
                throw Error();
            case 3: return [2 /*return*/];
        }
    });
}); };
var csvoutPut = function (appName, csv) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs.writeFile("./results/".concat(appName, ".csv"), iconv.encode(csv.join("\n"), 'Shift_JIS'), function (err) {
            if (err) {
                console.error('ファイル書き込み中にエラーが発生しました:', err);
            }
            else {
                console.log('ファイルが正常に保存されました。');
            }
        });
        return [2 /*return*/];
    });
}); };
var execRedhat = function () { return __awaiter(void 0, void 0, void 0, function () {
    var filePath, urlList, contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                filePath = "redhat";
                return [4 /*yield*/, getFileLinkList(filePath)];
            case 1:
                urlList = _a.sent();
                return [4 /*yield*/, Promise.all(urlList.map(function (url) { return __awaiter(void 0, void 0, void 0, function () {
                        var html;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fetchHtml(url)];
                                case 1:
                                    html = _a.sent();
                                    return [2 /*return*/, pullOutContents_Redhat(url, html)];
                            }
                        });
                    }); }))];
            case 2:
                contents = _a.sent();
                csvoutPut(filePath, contents);
                return [2 /*return*/];
        }
    });
}); };
var execSubversion = function () { return __awaiter(void 0, void 0, void 0, function () {
    var filePath, urlList, contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                filePath = "subversion";
                return [4 /*yield*/, getFileLinkList(filePath)];
            case 1:
                urlList = _a.sent();
                return [4 /*yield*/, Promise.all(urlList.map(function (url) { return __awaiter(void 0, void 0, void 0, function () {
                        var html;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fetchHtml(url)];
                                case 1:
                                    html = _a.sent();
                                    return [2 /*return*/, pullOutContents_Subversion(url, html)];
                            }
                        });
                    }); }))];
            case 2:
                contents = _a.sent();
                csvoutPut(filePath, contents);
                return [2 /*return*/];
        }
    });
}); };
var execRenorex = function () { return __awaiter(void 0, void 0, void 0, function () {
    var filePath, urlList, contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                filePath = "Renorex";
                return [4 /*yield*/, getFileLinkList(filePath)];
            case 1:
                urlList = _a.sent();
                return [4 /*yield*/, Promise.all(urlList.map(function (url) { return __awaiter(void 0, void 0, void 0, function () {
                        var html;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fetchHtml(url)];
                                case 1:
                                    html = _a.sent();
                                    return [2 /*return*/, pullOutContents_Renorex(url, html)];
                            }
                        });
                    }); }))];
            case 2:
                contents = _a.sent();
                csvoutPut(filePath, contents);
                return [2 /*return*/];
        }
    });
}); };
var execJtest = function () { return __awaiter(void 0, void 0, void 0, function () {
    var filePath, urlList, contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                filePath = "Jtest";
                return [4 /*yield*/, getFileLinkList(filePath)];
            case 1:
                urlList = _a.sent();
                return [4 /*yield*/, Promise.all(urlList.map(function (url) { return __awaiter(void 0, void 0, void 0, function () {
                        var html;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fetchHtml(url)];
                                case 1:
                                    html = _a.sent();
                                    return [2 /*return*/, pullOutContents_Jtest(url, html)];
                            }
                        });
                    }); }))];
            case 2:
                contents = _a.sent();
                csvoutPut(filePath, contents);
                return [2 /*return*/];
        }
    });
}); };
var execPosgreSql = function () { return __awaiter(void 0, void 0, void 0, function () {
    var filePath, urlList, contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                filePath = "PosgreSql";
                return [4 /*yield*/, getFileLinkList(filePath)];
            case 1:
                urlList = _a.sent();
                return [4 /*yield*/, Promise.all(urlList.map(function (url) { return __awaiter(void 0, void 0, void 0, function () {
                        var html;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fetchHtml(url)];
                                case 1:
                                    html = _a.sent();
                                    return [2 /*return*/, pullOutContents_PosgreSql(url, html)];
                            }
                        });
                    }); }))];
            case 2:
                contents = _a.sent();
                console.log("PosgreSql");
                csvoutPut(filePath, contents);
                return [2 /*return*/];
        }
    });
}); };
main();
var pullOutContents_Redhat = function (link, html) {
    // cheerio を使って HTML を解析
    var $ = cheerio.load(html);
    // const keyword = "BZ-"; 
    var matchedElements = [];
    $(".chapter").each(function (_, element) {
        // $(element).find(".anchor-heading").first().text();
        // const id = $(element).attr("id");
        // if (id && id.includes(keyword)) {
        //     const selectedElement = $(element); 
        var _a;
        matchedElements.push("\"".concat(link, "\",\"").concat(escapeCSVField($(element).find(".title").first().text()), "\",\"").concat(escapeCSVField(removeTag((_a = $(element).html()) !== null && _a !== void 0 ? _a : "")), "\""));
        // }
    });
    return matchedElements.join("\n");
};
var pullOutContents_Renorex = function (link, html) {
    var $ = cheerio.load(html);
    var csv = [];
    $('.accordion_block').each(function (index, h2) {
        csv.push("\"".concat(escapeCSVField(link), "\",\"").concat(escapeCSVField(removeTag(h2.toString())), "\""));
    });
    return csv.join("\n");
};
var pullOutContents_Jtest = function (link, html) {
    var $ = cheerio.load(html);
    var csv = [];
    $('.output-block').each(function (index, h2) {
        csv.push("\"".concat(escapeCSVField(link), "\",\"").concat(escapeCSVField(removeTag(h2.toString())), "\""));
    });
    return csv.join("\n");
};
var pullOutContents_Subversion = function (link, html) {
    // cheerio を使って HTML を解析
    var $ = cheerio.load(html);
    var csv = [];
    $('.h2').each(function (index, h2) {
        var _a;
        var matchedH3 = [];
        var h3Elements = $(h2).find('.h3');
        h3Elements.each(function (i, h3) {
            var _a;
            matchedH3.push((_a = $(h3).html()) !== null && _a !== void 0 ? _a : "");
            $(h3).remove();
        });
        var matchedH2 = (_a = $(h2).html()) !== null && _a !== void 0 ? _a : "";
        csv.push("\"".concat(escapeCSVField(link), "\",\"").concat(escapeCSVField(removeTag(matchedH2)), "\",\"\""));
        matchedH3.forEach(function (v) {
            csv.push("\"".concat(escapeCSVField(link), "\",\"\",\"").concat(escapeCSVField(removeTag(v)), "\""));
        });
    });
    return csv.join("\n");
};
var pullOutContents_PosgreSql = function (link, html) {
    // cheerio を使って HTML を解析
    var $ = cheerio.load(html);
    var csv = [];
    $('.sect2').each(function (index, element1) {
        if ($(element1).find(".title").first().text().includes("変更点"))
            return;
        $(element1).find(".itemizedlist, .itemizedList").first().find(".listitem").each(function (index, element2) {
            csv.push("\"".concat(link, "\",\"").concat($(element2).text(), "\""));
        });
        $(element1).find(".sect3").first().find(".listitem").each(function (index, element2) {
            csv.push("\"".concat(link, "\",\"").concat($(element2).text(), "\""));
        });
        $(element1).find(".sect4").first().find(".listitem").each(function (index, element2) {
            csv.push("\"".concat(link, "\",\"").concat($(element2).text(), "\""));
        });
    });
    return csv.join("\n");
};
function escapeCSVField(field) {
    // カンマ、ダブルクォーテーション、改行を含む場合はエスケープ
    return field.replace(/"/g, '""').replace(/,/g, '"",""');
}
var removeTag = function (html) {
    var $ = cheerio.load(html);
    var aTag = [];
    var imgTag = [];
    var tableTag = [];
    $('a').each(function (i, a) {
        if (a.name !== "a")
            return;
        var html = $(a).toString();
        $(a).html("ll".concat(i, "aTag").concat(i, "ll"));
        aTag.push({ html: html, replace: "ll".concat(i, "aTag").concat(i, "ll") });
    });
    $('img').each(function (i, img) {
        if (img.name !== "img")
            return;
        var html = $(img).toString();
        $(img).html("ll".concat(i, "imgTag").concat(i, "ll"));
        imgTag.push({ html: html, replace: "ll".concat(i, "imgTag").concat(i, "ll") });
    });
    $('table').each(function (i, table) {
        if (table.name !== "table")
            return;
        var html = $(table).toString();
        $(table).html("ll".concat(i, "tableTag").concat(i, "ll"));
        tableTag.push({ html: html, replace: "ll".concat(i, "tableTag").concat(i, "ll") });
    });
    var text = cheerio.load($.html().replace(/&nbsp;/g, " ")).text();
    tableTag.forEach(function (v) {
        var _a;
        if (!text.includes(v.replace)) {
            console.log(text);
            console.log(v.replace);
            // console.log(v.html)
            throw Error();
        }
        text = text.replace(v.replace, (_a = v.html) !== null && _a !== void 0 ? _a : "");
    });
    aTag.forEach(function (v) {
        var _a, _b;
        if (!text.includes(v.replace)) {
            console.log(text);
            console.log(v.replace);
            // console.log(v.html)
            throw Error();
        }
        text = text.replace((_a = v.replace) !== null && _a !== void 0 ? _a : "", (_b = v.html) !== null && _b !== void 0 ? _b : "");
    });
    imgTag.forEach(function (v) {
        var _a, _b;
        if (!text.includes(v.replace)) {
            console.log(text);
            console.log(v.replace);
            console.log(v.html);
            throw Error();
        }
        text = text.replace((_a = v.replace) !== null && _a !== void 0 ? _a : "", (_b = v.html) !== null && _b !== void 0 ? _b : "");
    });
    return text;
};
// 実行
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // execRedhat();
            execPosgreSql();
            return [2 /*return*/];
        });
    });
}
