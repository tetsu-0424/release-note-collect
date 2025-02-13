import * as fs from "fs";
import {exec} from "child_process";
import {promisify} from "util";
import * as cheerio from "cheerio"; // `cheerio` を追加
import * as iconv from 'iconv-lite';
// import { pullOutContents_Jtest, pullOutContents_Redhat, pullOutContents_Renorex, pullOutContents_Subversion } from "./logics/htmlPullOut";


const execPromise = promisify(exec);

// ファイルを読み込んでリンクを取得
const getFileLinkList = async (filePath: string): Promise<string[]> => {
    try {
        const data = await fs.readFileSync(`./links/${filePath}.txt`, "utf-8");
        return data
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.startsWith("http"));
    } catch (error) {
        console.error("ファイルの読み込みに失敗しました:", error);
        return [];
    }
}

const fetchHtml = async (url: string) => {
    try {
        const {stdout: html} = await execPromise(`curl -A "Mozilla/5.0" -L ${url}`, {maxBuffer: 1024 * 1024 * 10});
        // console.log(html);
        return html;
    } catch (error) {
        console.error("html取得時にエラーが発生しました。")
        throw Error();
    }
}

const csvoutPut = async (appName: string, csv: string[]) => {

    const escaped = csv.join("\n").replace(/\u00A0/g, " "); // ノーブレークスペースを通常のスペースに
    fs.writeFile(`./results/${appName}.csv`, iconv.encode(escaped, 'SHIFT-JIS'), (err) => {
        if (err) {
            console.error('ファイル書き込み中にエラーが発生しました:', err);
        } else {
            console.log('ファイルが正常に保存されました。');
        }
    });
}

const execRedhat = async () => {
    const filePath = "redhat";
    const urlList = await getFileLinkList(filePath);
    const contents = await Promise.all(
        urlList.map(async url => {
            const html = await fetchHtml(url);
            return pullOutContents_Redhat(url, html);
        })
    );
    csvoutPut(filePath, contents)
}

const execSubversion = async () => {
    const filePath = "subversion";
    const urlList = await getFileLinkList(filePath);
    const contents = await Promise.all(
        urlList.map(async url => {
            const html = await fetchHtml(url);
            return pullOutContents_Subversion(url, html);
        })
    );
    csvoutPut(filePath, contents)
}
const execRenorex = async () => {
    const filePath = "Renorex";
    const urlList = await getFileLinkList(filePath);
    const contents = await Promise.all(
        urlList.map(async url => {
            const html = await fetchHtml(url);
            return pullOutContents_Renorex(url, html);
        })
    );
    csvoutPut(filePath, contents)
}

const execJtest = async () => {
    const filePath = "Jtest";
    const urlList = await getFileLinkList(filePath);
    const contents = await Promise.all(
        urlList.map(async url => {
            const html = await fetchHtml(url);
            return pullOutContents_Jtest(url, html);
        })
    );
    csvoutPut(filePath, contents)
}

const execPosgreSql = async () => {
    const filePath = "PosgreSql";
    const urlList = await getFileLinkList(filePath);
    const contents = await Promise.all(
        urlList.map(async url => {
            const html = await fetchHtml(url);
            return pullOutContents_PosgreSql(url, html);
        })
    );
    console.log("PosgreSql");
    csvoutPut(filePath, contents);
}

const execJavaSe = async () => {
    const filePath = "JavaSe";
    const urlList = await getFileLinkList(filePath);
    const contents = await Promise.all(
        urlList.map(async url => {
            const html = await fetchHtml(url);
            return pullOutContents_JavaSe(url, html);
        })
    );
    console.log("PosgreSql");
    csvoutPut(filePath, contents);
}


const execSOAtest = async () => {
    const filePath = "SOAtest";
    const urlList = await getFileLinkList(filePath);
    const contents = await Promise.all(
        urlList.map(async url => {
            const html = await fetchHtml(url);
            return pullOutContents_SOAtest(url, html);
        })
    );
    console.log("SOAtest");
    csvoutPut(filePath, contents);
}

main();


const pullOutContents_Redhat = (link: string, html: string) => {
    // cheerio を使って HTML を解析
    const $ = cheerio.load(html);
    const version = $(".productnumber").text();
    // const keyword = "BZ-"; 
    const matchedElements: string[] = [];
    $("#kernel_parameters_changes").each((_, kernel_parameters_changes) => {
        const title = $(kernel_parameters_changes).find(".title").first().text();
        $(kernel_parameters_changes).find(".variablelist").each((index, variablelist) => {
            if (!$(variablelist).parent().hasClass("chapter")) return;
            const subTitle = $(variablelist).parent().find(".title").first().text();
            $(variablelist).find("dd").each((index, dd) => {
                const text = `${$(dd).prev().text()} \n${$(dd).text()} `;
                matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","","${escapeCSVField(text)}"`);
            })
        })
    });
    $("#new_features").each((_, new_features) => {
        const title = $(new_features).find(".title").first().text();
        $(new_features).find(".section").each((index, section) => {
            if (!$(section).parent().hasClass("chapter")) return;
            const subTitle = $(section).find(".title").first().text();
            $(section).find(".formalpara").each((index, formalpara) => {

                let nowElement = $(formalpara).next();
                let text = $(formalpara).text();
                for (let i = 0; i < 100; i++) {
                    if (nowElement.hasClass("formalpara")) break;
                    text += `\n ${nowElement.text()}`;
                    nowElement = $(nowElement).next();
                }
                matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","","${escapeCSVField(text)}"`);
            })
        });
    });
    $("#device_drivers").each((_, device_drivers) => {
        // $(chapter).find("#kernel_parameters_changes").each((_, kernel_parameters_changes) => {
        const title = $(device_drivers).find(".title").first().text();
        $(device_drivers).find(".section").each((index, section) => {
            if (!$(section).parent().hasClass("chapter")) return;
            const subTitle = $(section).find(".title").first().text();
            $(section).find(".itemizedlist").each((index, itemizedlist) => {
                if (!$(itemizedlist).parent().hasClass("section")) return;
                let subsubTitle = $(itemizedlist).prev().text();
                matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","${escapeCSVField(subsubTitle)}","${escapeCSVField($(itemizedlist).text())}"`);
            })
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
            if (!$(section).parent().hasClass("chapter")) return;
            const subTitle = $(section).find(".title").first().text();
            $(section).find(".formalpara").each((index, formalpara) => {
                let nowElement = $(formalpara).next();
                let text = $(formalpara).text();
                for (let i = 0; i < 100; i++) {
                    if (nowElement.hasClass("formalpara")) break;
                    text += `\n ${nowElement.text()}`;
                    nowElement = $(nowElement).next();
                }
                matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","","${escapeCSVField(text)}"`);
            })
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

            if (!$(section).parent().hasClass("chapter")) return;
            const subTitle = $(section).find(".title").first().text();
            $(section).find(".formalpara").each((index, formalpara) => {
                let nowElement = $(formalpara).next();
                let text = $(formalpara).text();
                for (let i = 0; i < 100; i++) {
                    if (nowElement.hasClass("formalpara")) break;
                    text += `\n ${nowElement.text()}`;
                    nowElement = $(nowElement).next();
                }
                matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","","${escapeCSVField(text)}"`);
            })
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
            if (!$(section).parent().hasClass("chapter")) return;
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
            if (!$(section).parent().hasClass("chapter")) return;
            const subTitle = $(section).find(".title").text();
            matchedElements.push(`"${link}","${version}","${escapeCSVField(title)}","${escapeCSVField(subTitle)}","","${escapeCSVField($(section).text().length > 30000 ? `${$(section).text().substring(0, 30000)}　続く` : $(section).text())}"`);
        });
    });


    return matchedElements.join("\n")
}

//多分問題なさそう
const pullOutContents_Renorex = (link: string, html: string) => {
    const $ = cheerio.load(html);
    const csv: string[] = [];
    $('.accordion_block').each((index, h2) => {
        const title = $(h2).find(".accordion_title").first();
        const regex = /\d+\.\d+\.\d+/;
        const match = title.text().match(regex);

        if (match) {
            console.log(match[0]);  // 出力: 10.1.4
        } else {
            throw Error;
        }
        let subTitle: string;

        $(h2).find(".accordion_content").first().find("ul").each((index2, element2) => {
            if (!$(element2).parent().hasClass("accordion_content")) return;
            subTitle = $(element2).prev().first().text();
            $(element2).find("li").each((index3, element3) => {
                csv.push(`"${escapeCSVField(link)}","${escapeCSVField(match[0])}","${removeTag(subTitle)}","${escapeCSVField(removeTag($(element3).text()))}"`);
            })
        });
    })
    return csv.join("\n");
}

const pullOutContents_Jtest = (link: string, html: string) => {
    const $ = cheerio.load(html);
    const csv: string[] = [];
    $('.output-block').each((index, h2) => {
        csv.push(`"${escapeCSVField(link)}","${escapeCSVField(removeTag(h2.toString()))}"`);
    })
    return csv.join("\n");
}

const pullOutContents_Subversion = (link: string, html: string) => {
    // cheerio を使って HTML を解析
    const $ = cheerio.load(html);
    const csv: string[] = [];

    $('.h2').each((index, h2) => {
        const matchedH3: string[] = [];
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
    })

    return csv.join("\n");

}

const pullOutContents_PosgreSql = (link: string, html: string) => {
    // cheerio を使って HTML を解析
    const $ = cheerio.load(html);
    const csv: string[] = [];
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
                const title2 = $(element2).parent().parent().parent().parent().find(".title").first().text()
                csv.push(`"${link}","${version}","${title2}","${title}","","${escapeCSVField($(element2).text())}"`);
            }
            if ($(element2).parent().parent().parent().hasClass("sect4")) {
                const title2 = $(element2).parent().parent().parent().parent().parent().find(".title").first().text();
                const title3 = $(element2).parent().parent().parent().parent().find(".title").first().text()
                csv.push(`"${link}","${version}","${title2}","${title3}","${title}","${escapeCSVField($(element2).text())}"`);
            }
        })
    })

    return csv.join("\n");

}

const pullOutContents_JavaSe = (link: string, html: string) => {
    // cheerio を使って HTML を解析
    const $ = cheerio.load(html);
    const csv: string[] = [];
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

}


const pullOutContents_SOAtest = (link: string, html: string) => {

    const resolveTextContent = (element: any) => {
        let contentText = "";
        $(element).nextUntil('h1, h2').each((_, el) => {
            if ($(el).is('ul')) {
                $(el).find('li').each((_, li) => {
                    contentText += `  - ${$(li).text().trim()}\n`;
                });
            } else if ($(el).is('div') && $(el).hasClass('table-wrap')) {
                $(el).find('tr').each((_, tr) => {
                    $(tr).find('th, td').each((_, thd) => {
                        contentText += `| ${$(thd).text().trim()} `;
                    });
                    contentText += "|\n";
                });
            } else {
                contentText += $(el).text().trim() + "\n";
            }
        });
        return escapeCSVField(contentText);
    }


    // cheerio を使って HTML を解析
    const $ = cheerio.load(html);
    const csv: string[] = [];

    const excludeH1Ids = ["title-text"]
    const excludeH1Titles = ["Overview"]
    let h2Skip = false
    let h3Skip = false
    let prevTag = ""

    $('main').each((index, mainTag) => {
        $(mainTag).find("h1, h2, h3").each((index, element) => {
            if ($(element).is('h1')) {
                const id = $(element).attr("id")
                if ((id! && excludeH1Ids.includes(id)) || excludeH1Titles.includes($(element).text())) {
                    h2Skip = true;
                    h3Skip = true;
                    return;
                }
                prevTag = "h1"
                h2Skip = false;
                h3Skip = false;
                const title = replaceQuestion2WhiteSpace($(element).text());
                csv.push(`"${link}","${title}","","","${resolveTextContent(element)}"`);
            } else if (!h2Skip && $(element).is('h2')) {
                prevTag = "h2"
                const title = replaceQuestion2WhiteSpace($(element).text());
                csv.push(`"${link}","","${title}","","${resolveTextContent(element)}"`);
            } else if (!h3Skip && $(element).is('h3')) {
                const title = replaceQuestion2WhiteSpace($(element).text());
                if (prevTag = "h1") {
                    csv.push(`"${link}","","${title}","","${resolveTextContent(element)}"`);
                } else {
                    csv.push(`"${link}","","","${title}","${resolveTextContent(element)}"`);
                }
                prevTag = "h3"
            }

        });
    });
    return csv.join("\n");

}


function replaceQuestion2WhiteSpace(field: string): string {
    return field.replace("?", " ");
}

function escapeCSVField(field: string): string {
    // カンマ、ダブルクォーテーション、改行を含む場合はエスケープ
    return field.replace(/"/g, '""').replace("?", " ");
}

const removeTag = (html: string): string => {
    const $ = cheerio.load(html);
    const aTag: { html: string, replace: string }[] = [];
    const imgTag: { html: string, replace: string }[] = [];
    const tableTag: { html: string, replace: string }[] = [];
    $('a').each((i, a) => {
        if (a.name !== "a") return;
        const html = $(a).toString();
        $(a).html(`ll${i}aTag${i}ll`);
        aTag.push({html, replace: `ll${i}aTag${i}ll`});
    });
    $('img').each((i, img) => {
        if (img.name !== "img") return;
        const html = $(img).toString();
        $(img).html(`ll${i}imgTag${i}ll`);
        imgTag.push({html, replace: `ll${i}imgTag${i}ll`});
    });
    $('table').each((i, table) => {
        if (table.name !== "table") return;
        const html = $(table).toString();
        $(table).html(`ll${i}tableTag${i}ll`);
        tableTag.push({html, replace: `ll${i}tableTag${i}ll`});
    });
    let text = cheerio.load($.html().replace(/&nbsp;/g, " ")).text()


    tableTag.forEach(v => {
        if (!text.includes(v.replace)) {
            console.log(text)
            console.log(v.replace)
            // console.log(v.html)
            throw Error();
        }
        text = text.replace(v.replace, v.html ?? "");
    })
    aTag.forEach(v => {
        if (!text.includes(v.replace)) {
            console.log(text)
            console.log(v.replace)
            // console.log(v.html)
            throw Error();
        }
        text = text.replace(v.replace ?? "", v.html ?? "");
    })

    imgTag.forEach(v => {
        if (!text.includes(v.replace)) {
            console.log(text)
            console.log(v.replace)
            console.log(v.html)
            throw Error();
        }
        text = text.replace(v.replace ?? "", v.html ?? "");
    })

    return text
}

// 実行
async function main() {
    // execRedhat();
    // execPosgreSql();
    // execJavaSe();
    // execSubversion();

    // execJtest();


    // execRenorex();
    execSOAtest();
}