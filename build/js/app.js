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
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const cheerio = __importStar(require("cheerio")); // `cheerio` を追加
const iconv = __importStar(require("iconv-lite"));
// import { pullOutContents_Jtest, pullOutContents_Redhat, pullOutContents_Renorex, pullOutContents_Subversion } from "./logics/htmlPullOut";
const execPromise = (0, util_1.promisify)(child_process_1.exec);
// ファイルを読み込んでリンクを取得
const getFileLinkList = async (filePath) => {
    try {
        const data = await fs.readFileSync(`./links/${filePath}.txt`, "utf-8");
        return data
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.startsWith("http"));
    }
    catch (error) {
        console.error("ファイルの読み込みに失敗しました:", error);
        return [];
    }
};
const fetchHtml = async (url) => {
    try {
        const { stdout: html } = await execPromise(`curl -A "Mozilla/5.0" -L ${url}`, { maxBuffer: 1024 * 1024 * 10 });
        // console.log(html);
        return html;
    }
    catch (error) {
        console.error("html取得時にエラーが発生しました。");
        throw Error();
    }
};
const csvoutPut = async (appName, csv) => {
    fs.writeFile(`./results/${appName}.csv`, iconv.encode(csv.join("\n"), 'SHIFT-JIS'), (err) => {
        if (err) {
            console.error('ファイル書き込み中にエラーが発生しました:', err);
        }
        else {
            console.log('ファイルが正常に保存されました。');
        }
    });
};
const execRedhat = async () => {
    const filePath = "redhat";
    const urlList = await getFileLinkList(filePath);
    const contents = await Promise.all(urlList.map(async (url) => {
        const html = await fetchHtml(url);
        return pullOutContents_Redhat(url, html);
    }));
    csvoutPut(filePath, contents);
};
const execSubversion = async () => {
    const filePath = "subversion";
    const urlList = await getFileLinkList(filePath);
    const contents = await Promise.all(urlList.map(async (url) => {
        const html = await fetchHtml(url);
        return pullOutContents_Subversion(url, html);
    }));
    csvoutPut(filePath, contents);
};
const execRenorex = async () => {
    const filePath = "Renorex";
    const urlList = await getFileLinkList(filePath);
    const contents = await Promise.all(urlList.map(async (url) => {
        const html = await fetchHtml(url);
        return pullOutContents_Renorex(url, html);
    }));
    csvoutPut(filePath, contents);
};
const execJtest = async () => {
    const filePath = "Jtest";
    const urlList = await getFileLinkList(filePath);
    const contents = await Promise.all(urlList.map(async (url) => {
        const html = await fetchHtml(url);
        return pullOutContents_Jtest(url, html);
    }));
    csvoutPut(filePath, contents);
};
const execPosgreSql = async () => {
    const filePath = "PosgreSql";
    const urlList = await getFileLinkList(filePath);
    const contents = await Promise.all(urlList.map(async (url) => {
        const html = await fetchHtml(url);
        return pullOutContents_PosgreSql(url, html);
    }));
    console.log("PosgreSql");
    csvoutPut(filePath, contents);
};
const execJavaSe = async () => {
    const filePath = "JavaSe";
    const urlList = await getFileLinkList(filePath);
    const contents = await Promise.all(urlList.map(async (url) => {
        const html = await fetchHtml(url);
        return pullOutContents_JavaSe(url, html);
    }));
    console.log("PosgreSql");
    csvoutPut(filePath, contents);
};
main();
const pullOutContents_Redhat = (link, html) => {
    // cheerio を使って HTML を解析
    const $ = cheerio.load(html);
    const version = $(".productnumber").text();
    // const keyword = "BZ-"; 
    const matchedElements = [];
    $("#kernel_parameters_changes").each((_, kernel_parameters_changes) => {
        const title = $(kernel_parameters_changes).find(".title").first().text();
        $(kernel_parameters_changes).find(".variablelist").each((index, variablelist) => {
            if (!$(variablelist).parent().hasClass("chapter"))
                return;
            const subTitle = $(variablelist).parent().find(".title").first().text();
            $(variablelist).find("dd").each((index, dd) => {
                const text = `${$(dd).prev().text()} \n${$(dd).text()} `;
                matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","","${escapeCSVField(text)}"`);
            });
        });
    });
    $("#new_features").each((_, new_features) => {
        const title = $(new_features).find(".title").first().text();
        $(new_features).find(".section").each((index, section) => {
            if (!$(section).parent().hasClass("chapter"))
                return;
            const subTitle = $(section).find(".title").first().text();
            $(section).find(".formalpara").each((index, formalpara) => {
                let nowElement = $(formalpara).next();
                let text = $(formalpara).text();
                for (let i = 0; i < 100; i++) {
                    if (nowElement.hasClass("formalpara"))
                        break;
                    text += `\n ${nowElement.text()}`;
                    nowElement = $(nowElement).next();
                }
                matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","","${escapeCSVField(text)}"`);
            });
        });
    });
    $("#device_drivers").each((_, device_drivers) => {
        // $(chapter).find("#kernel_parameters_changes").each((_, kernel_parameters_changes) => {
        const title = $(device_drivers).find(".title").first().text();
        $(device_drivers).find(".section").each((index, section) => {
            if (!$(section).parent().hasClass("chapter"))
                return;
            const subTitle = $(section).find(".title").first().text();
            $(section).find(".itemizedlist").each((index, itemizedlist) => {
                if (!$(itemizedlist).parent().hasClass("section"))
                    return;
                let subsubTitle = $(itemizedlist).prev().text();
                matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","${escapeCSVField(subsubTitle)}","${escapeCSVField($(itemizedlist).text())}"`);
            });
        });
    });
    $("#bug_fixes").each((_, bug_fixes) => {
        // $(chapter).find("#kernel_parameters_changes").each((_, kernel_parameters_changes) => {
        const title = $(bug_fixes).find(".title").first().text();
        // if($(bug_fixes).hasClass("section")){
        //     const parentTitle = $(bug_fixes).parent().find(".title").text();
        //     $(bug_fixes).find(".formalpara").each((index, formalpara) => {
        //         const subsubTitle = $(formalpara).find(".title").text();
        //         let nowElement = $(formalpara).next();
        //         let text = $(formalpara).text();
        //         for (let i = 0; i < 100; i++) {
        //             if (nowElement.hasClass("formalpara")) break;
        //             text += `\n ${nowElement.text()}`;
        //             nowElement = $(nowElement).next();
        //         }
        //         matchedElements.push(`"${link}","${version}","${escapeCSVField(parentTitle)}","${escapeCSVField(title)}","${escapeCSVField(subsubTitle)}","${escapeCSVField(text)}"`);
        //     })
        // }
        $(bug_fixes).find(".section").each((index, section) => {
            if (!$(section).parent().hasClass("chapter"))
                return;
            const subTitle = $(section).find(".title").first().text();
            $(section).find(".formalpara").each((index, formalpara) => {
                let nowElement = $(formalpara).next();
                let text = $(formalpara).text();
                for (let i = 0; i < 100; i++) {
                    if (nowElement.hasClass("formalpara"))
                        break;
                    text += `\n ${nowElement.text()}`;
                    nowElement = $(nowElement).next();
                }
                matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","","${escapeCSVField(text)}"`);
            });
        });
    });
    $("#technology_previews").each((_, technology_previews) => {
        const title = $(technology_previews).find(".title").first().text();
        // if($(technology_previews).hasClass("section")){
        //     const parentTitle = $(technology_previews).parent().find(".title").text();
        //     $(technology_previews).find(".formalpara").each((index, formalpara) => {
        //         const subsubTitle = $(formalpara).find(".title").text();
        //         let nowElement = $(formalpara).next();
        //         let text = $(formalpara).text();
        //         for (let i = 0; i < 100; i++) {
        //             if (nowElement.hasClass("formalpara")) break;
        //             text += `\n ${nowElement.text()}`;
        //             nowElement = $(nowElement).next();
        //         }
        //         matchedElements.push(`"${link}","${version}","${escapeCSVField(parentTitle)}","${escapeCSVField(title)}","${escapeCSVField(subsubTitle)}","${escapeCSVField(text)}"`);
        //     })
        // }
        $(technology_previews).find(".section").each((index, section) => {
            if (!$(section).parent().hasClass("chapter"))
                return;
            const subTitle = $(section).find(".title").first().text();
            $(section).find(".formalpara").each((index, formalpara) => {
                let nowElement = $(formalpara).next();
                let text = $(formalpara).text();
                for (let i = 0; i < 100; i++) {
                    if (nowElement.hasClass("formalpara"))
                        break;
                    text += `\n ${nowElement.text()}`;
                    nowElement = $(nowElement).next();
                }
                matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","","${escapeCSVField(text)}"`);
            });
        });
    });
    $("#deprecated_functionality").each((_, deprecated_functionality) => {
        const title = $(deprecated_functionality).find(".title").first().text();
        // if($(deprecated_functionality).hasClass("section")){
        //     const parentTitle = $(deprecated_functionality).parent().find(".title").text();
        //     $(deprecated_functionality).find(".section").each((index, section) => {
        //         if (!$(section).parent().hasClass("chapter")) return;
        //         const subTitle = $(section).find(".title").text();
        //         $(section).find(".formalpara").each((index, formalpara) => {
        //             let nowElement = $(formalpara).next();
        //             let text = $(formalpara).text();
        //             for (let i = 0; i < 100; i++) {
        //                 if (nowElement.hasClass("formalpara")) break;
        //                 text += `\n ${nowElement.text()}`;
        //                 nowElement = $(nowElement).next();
        //             }
        //             matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","","${escapeCSVField(text)}"`);
        //         })
        //     });
        // }
        $(deprecated_functionality).find(".section").each((index, section) => {
            if (!$(section).parent().hasClass("chapter"))
                return;
            const subTitle = $(section).find(".title").first().text();
            matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","","${escapeCSVField($(section).text().length > 30000 ? `${$(section).text().substring(0, 30000)}　続く` : $(section).text())}"`);
        });
    });
    // $("#removed_functionality").each((_, removed_functionality) => {
    //     const title = $(removed_functionality).find(".title").first().text();
    //     $(removed_functionality).find(".section").each((index, section) => {
    //         if (!$(section).parent().hasClass("chapter")) return;
    //         const subTitle = $(section).find(".title").first().text();
    //         matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","","${escapeCSVField($(section).text().length > 30000 ? `${$(section).text().substring(0, 30000)}　続く` : $(section).text())}"`);
    //     });
    // });
    $("#internationalization").each((_, internationalization) => {
        const title = $(internationalization).find(".title").first().text();
        $(internationalization).find(".section").each((index, section) => {
            if (!$(section).parent().hasClass("chapter"))
                return;
            const subTitle = $(section).find(".title").text();
            matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","","${escapeCSVField($(section).text().length > 30000 ? `${$(section).text().substring(0, 30000)}　続く` : $(section).text())}"`);
        });
    });
    return matchedElements.join("\n");
};
//多分問題なさそう
const pullOutContents_Renorex = (link, html) => {
    const $ = cheerio.load(html);
    const csv = [];
    $('.accordion_block').each((index, h2) => {
        const title = $(h2).find(".accordion_title").first();
        const regex = /\d+\.\d+\.\d+/;
        const match = title.text().match(regex);
        if (match) {
            console.log(match[0]); // 出力: 10.1.4
        }
        else {
            throw Error;
        }
        let subTitle;
        $(h2).find(".accordion_content").first().find("ul").each((index2, element2) => {
            if (!$(element2).parent().hasClass("accordion_content"))
                return;
            subTitle = $(element2).prev().first().text();
            $(element2).find("li").each((index3, element3) => {
                csv.push(`"${escapeCSVField(link)}","${escapeCSVField(match[0])}","${removeTag(subTitle)}","${escapeCSVField(removeTag($(element3).text()))}"`);
            });
        });
    });
    return csv.join("\n");
};
const pullOutContents_Jtest = (link, html) => {
    const $ = cheerio.load(html);
    const csv = [];
    $('.output-block').each((index, h2) => {
        csv.push(`"${escapeCSVField(link)}","${escapeCSVField(removeTag(h2.toString()))}"`);
    });
    return csv.join("\n");
};
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
const pullOutContents_PosgreSql = (link, html) => {
    // cheerio を使って HTML を解析
    const $ = cheerio.load(html);
    const csv = [];
    const version = $('.sect1').first().attr('id');
    $('.sect2').each((index, element1) => {
        // if($(element1).find(".title").first().text().includes("変更点")) return;
        $(element1).find(".listitem").each((index, element2) => {
            const title = $(element2).parent().parent().parent().find(".title").first().text();
            // if(title.includes)
            if ($(element2).parent().parent().parent().hasClass("sect2")) {
                csv.push(`"${link}","${version}","${title}","","","${escapeCSVField($(element2).text())}"`);
            }
            if ($(element2).parent().parent().parent().hasClass("sect3")) {
                const title2 = $(element2).parent().parent().parent().parent().find(".title").first().text();
                csv.push(`"${link}","${version}","${title2}","${title}","","${escapeCSVField($(element2).text())}"`);
            }
            if ($(element2).parent().parent().parent().hasClass("sect4")) {
                const title2 = $(element2).parent().parent().parent().parent().parent().find(".title").first().text();
                const title3 = $(element2).parent().parent().parent().parent().find(".title").first().text();
                csv.push(`"${link}","${version}","${title2}","${title3}","${title}","${escapeCSVField($(element2).text())}"`);
            }
        });
        // $(element1).find(".itemizedlist").first().find(".listitem").each((index,element2) => {
        //     const title = $(element2).parent().parent().parent().find(".title").first().text();
        //     // if(title.includes)
        //     csv.push(`"${link}","${title}","${escapeCSVField($(element2).text())}"`);
        // })
        // $(element1).find(".sect3").first().find(".listitem").each((index,element2) => {
        //     csv.push(`"${link}","${$(element2).text()}"`);
        // })
        // $(element1).find(".sect4").first().find(".listitem").each((index,element2) => {
        //     csv.push(`"${link}","${$(element2).text()}"`);
        // })
    });
    return csv.join("\n");
};
const pullOutContents_JavaSe = (link, html) => {
    // cheerio を使って HTML を解析
    const $ = cheerio.load(html);
    const csv = [];
    $('h4').each((index, element1) => {
        const title = $(element1).text();
        if (title === 'Bug Fixes') {
            csv.push(`"${link}","${title}","${escapeCSVField($(element1).next().text())}"`);
        }
        let nowElement = $(element1);
        for (let i = 0; i < 100; i++) {
            if (nowElement.next().hasClass("release-note")) {
                csv.push(`"${link}","${title}","${escapeCSVField(nowElement.next().text())}"`);
            }
            nowElement = nowElement.next();
            if (nowElement.get(0)?.name == "h4") {
                break;
            }
        }
    });
    // $('.release-note').each((index, element1) => {
    //     if(index === 0) title = $(element1).prev().first().text();
    //     // $(element1).find(".itemizedlist").first().find(".listitem").each((index,element2) => {
    //         // const title = $(element2).parent().parent().parent().find(".title").first().text();
    //         // if(title.includes)
    //         csv.push(`"${link}","${title}","${escapeCSVField($(element1).text())}"`);
    //     // })
    //     // $(element1).find(".sect3").first().find(".listitem").each((index,element2) => {
    //     //     csv.push(`"${link}","${$(element2).text()}"`);
    //     // })
    //     // $(element1).find(".sect4").first().find(".listitem").each((index,element2) => {
    //     //     csv.push(`"${link}","${$(element2).text()}"`);
    //     // })
    // })
    return csv.join("\n");
};
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
// 実行
async function main() {
    execRedhat();
    // execPosgreSql();
    // execJavaSe();
    // execSubversion();
    // execJtest();
    // execRenorex();
}
//# sourceMappingURL=app.js.map