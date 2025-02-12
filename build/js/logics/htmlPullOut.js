"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullOutContents_Subversion = exports.pullOutContents_Jtest = exports.pullOutContents_Renorex = exports.pullOutContents_Redhat = void 0;
const cheerio = __importStar(require("cheerio")); // `cheerio` を追加
const pullOutContents_Redhat = (link, html) => {
    // cheerio を使って HTML を解析
    const $ = cheerio.load(html);
    // const keyword = "BZ-"; 
    const matchedElements = [];
    $(".chapter").each((_, element) => {
        // $(element).find(".anchor-heading").first().text();
        // const id = $(element).attr("id");
        // if (id && id.includes(keyword)) {
        //     const selectedElement = $(element); 
        matchedElements.push(`"${link}","${escapeCSVField($(element).find(".anchor-heading").first().text())}","${escapeCSVField(removeTag($(element).html() ?? ""))}"`);
        // }
    });
    return matchedElements.join("\n");
};
exports.pullOutContents_Redhat = pullOutContents_Redhat;
const pullOutContents_Renorex = (link, html) => {
    const $ = cheerio.load(html);
    const csv = [];
    $('.accordion_block').each((index, h2) => {
        csv.push(`"${escapeCSVField(link)}","${escapeCSVField(removeTag(h2.toString()))}"`);
    });
    return csv.join("\n");
};
exports.pullOutContents_Renorex = pullOutContents_Renorex;
const pullOutContents_Jtest = (link, html) => {
    const $ = cheerio.load(html);
    const csv = [];
    $('.output-block').each((index, h2) => {
        csv.push(`"${escapeCSVField(link)}","${escapeCSVField(removeTag(h2.toString()))}"`);
    });
    return csv.join("\n");
};
exports.pullOutContents_Jtest = pullOutContents_Jtest;
const pullOutContents_Subversion = (link, html) => {
    // cheerio を使って HTML を解析
    const $ = cheerio.load(html);
    const csv = [];
    $('.h2').each((index, h2) => {
        const matchedH3 = [];
        const h3Elements = $(h2).find('.h3');
        h3Elements.each((i, h3) => {
            matchedH3.push($(h3).html() ?? "");
            $(h3).remove();
        });
        const matchedH2 = $(h2).html() ?? "";
        csv.push(`"${escapeCSVField(link)}","${escapeCSVField(removeTag(matchedH2))}",""`);
        matchedH3.forEach(v => {
            csv.push(`"${escapeCSVField(link)}","","${escapeCSVField(removeTag(v))}"`);
        });
    });
    return csv.join("\n");
};
exports.pullOutContents_Subversion = pullOutContents_Subversion;
function escapeCSVField(field) {
    // カンマ、ダブルクォーテーション、改行を含む場合はエスケープ
    return field.replace(/"/g, '""').replace(/,/g, '"",""');
}
const removeTag = (html) => {
    const $ = cheerio.load(html);
    const aTag = [];
    const imgTag = [];
    const tableTag = [];
    $('a').each((i, a) => {
        if (a.name !== "a")
            return;
        const html = $(a).toString();
        $(a).html(`ll${i}aTag${i}ll`);
        aTag.push({ html, replace: `ll${i}aTag${i}ll` });
    });
    $('img').each((i, img) => {
        if (img.name !== "img")
            return;
        const html = $(img).toString();
        $(img).html(`ll${i}imgTag${i}ll`);
        imgTag.push({ html, replace: `ll${i}imgTag${i}ll` });
    });
    $('table').each((i, table) => {
        if (table.name !== "table")
            return;
        const html = $(table).toString();
        $(table).html(`ll${i}tableTag${i}ll`);
        tableTag.push({ html, replace: `ll${i}tableTag${i}ll` });
    });
    let text = cheerio.load($.html().replace(/&nbsp;/g, " ")).text();
    tableTag.forEach(v => {
        if (!text.includes(v.replace)) {
            console.log(text);
            console.log(v.replace);
            // console.log(v.html)
            throw Error();
        }
        text = text.replace(v.replace, v.html ?? "");
    });
    aTag.forEach(v => {
        if (!text.includes(v.replace)) {
            console.log(text);
            console.log(v.replace);
            // console.log(v.html)
            throw Error();
        }
        text = text.replace(v.replace ?? "", v.html ?? "");
    });
    imgTag.forEach(v => {
        if (!text.includes(v.replace)) {
            console.log(text);
            console.log(v.replace);
            console.log(v.html);
            throw Error();
        }
        text = text.replace(v.replace ?? "", v.html ?? "");
    });
    return text;
};
//# sourceMappingURL=htmlPullOut.js.map