import * as fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import * as cheerio from "cheerio"; // `cheerio` を追加
import * as iconv from 'iconv-lite';

export const pullOutContents_Redhat = (link: string, html: string) => {
    // cheerio を使って HTML を解析
    const $ = cheerio.load(html);

    // const keyword = "BZ-"; 
    const matchedElements: string[] = [];
    $(".chapter").each((_, element) => {
        // $(element).find(".anchor-heading").first().text();
        // const id = $(element).attr("id");
        // if (id && id.includes(keyword)) {
        //     const selectedElement = $(element); 

            matchedElements.push(`"${link}","${escapeCSVField($(element).find(".anchor-heading").first().text())}","${escapeCSVField(removeTag($(element).html() ?? ""))}"`);
        // }
    });

    return matchedElements.join("\n")
}

export const pullOutContents_Renorex = (link: string, html: string) => {
    const $ = cheerio.load(html);
    const csv : string[] = [];
    $('.accordion_block').each((index, h2) => {
        csv.push(`"${escapeCSVField(link)}","${escapeCSVField(removeTag(h2.toString()))}"`);
    })
    return csv.join("\n");
}

export const pullOutContents_Jtest = (link: string, html: string) => {
    const $ = cheerio.load(html);
    const csv : string[] = [];
    $('.output-block').each((index, h2) => {
        csv.push(`"${escapeCSVField(link)}","${escapeCSVField(removeTag(h2.toString()))}"`);
    })
    return csv.join("\n");
}

export const pullOutContents_Subversion = (link: string, html: string) => {
    // cheerio を使って HTML を解析
    const $ = cheerio.load(html);
    const csv : string[] = [];

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
function escapeCSVField(field: string): string {
    // カンマ、ダブルクォーテーション、改行を含む場合はエスケープ

    return field.replace(/"/g, '""').replace(/,/g, '"",""');
}

const removeTag = (html: string):string => {
    const $ = cheerio.load(html);
    const aTag: { html: string, replace: string }[] = [];
    const imgTag: { html: string, replace: string }[] = [];
    const tableTag: { html: string, replace: string }[] = [];
    $('a').each((i, a) => {
        if (a.name !== "a") return;
        const html = $(a).toString();
        $(a).html(`ll${i}aTag${i}ll`);
        aTag.push({ html, replace: `ll${i}aTag${i}ll` });
    });
    $('img').each((i, img) => {
        if (img.name !== "img") return;
        const html = $(img).toString();
        $(img).html(`ll${i}imgTag${i}ll`);
        imgTag.push({ html, replace: `ll${i}imgTag${i}ll`});
    });
    $('table').each((i, table) => {
        if (table.name !== "table") return;
        const html = $(table).toString();
        $(table).html(`ll${i}tableTag${i}ll`);
        tableTag.push({ html, replace: `ll${i}tableTag${i}ll`});
    });
    let text = cheerio.load($.html().replace(/&nbsp;/g," ")).text()



    tableTag.forEach(v => {
        if(!text.includes(v.replace)) {
            console.log(text)
            console.log(v.replace)
            // console.log(v.html)
            throw Error();
        }
        text = text.replace(v.replace, v.html ?? "");
    })
    aTag.forEach(v => {
        if(!text.includes(v.replace)) {
            console.log(text)
            console.log(v.replace)
            // console.log(v.html)
            throw Error();
        }            
        text = text.replace(v.replace ?? "", v.html ?? "");
    })

    imgTag.forEach(v => {
        if(!text.includes(v.replace)) {
            console.log(text)
            console.log(v.replace)
            console.log(v.html)                
            throw Error();
        }            
        text = text.replace(v.replace ?? "", v.html ?? "");
    })

    return text
}