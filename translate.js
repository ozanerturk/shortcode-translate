

const fromLang = 'en';
const toLang = 'tr';

function canTranslate(text, n = 2) {
    //check if text linke font-awesome class name
    if (text == "][") {
        return false;
    }
    if (text.match(/fa-\w+/)) {
        return false;
    }
    //check if it is base64 encoded
    if (text.match(/^[a-zA-Z0-9+/]*={0,2}$/)) {
        return false;
    }
    //check if it is a link
    if (text.match(/^(http|https):\/\/[a-zA-Z0-9-\.]+\.[a-z]{2,4}/)) {
        return false;
    }
    //check if it is a number
    if (text.match(/^\d+$/)) {
        return false;

    }
    //check if it is a date
    if (text.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        return false;

    }
    //check if it is a time
    if (text.match(/^\d{1,2}:\d{1,2}:\d{1,2}$/)) {
        return false;

    }
    //check if it is a time
    if (text.match(/^\d{1,2}:\d{1,2}$/)) {
        return false;

    }

    //check if it contains at least n words
    if (text.split(' ').length < n) {
        return false;
    }

    return true;
}

async function stringReplaceAsync(str, regex, asyncFn) {
    const promises = [];
    str.replace(regex, (match, ...args) => {
        const promise = asyncFn(match, ...args);
        promises.push(promise);
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
}

function translateTextFromGoogle(text, from, to) {
    // return Promise.resolve(text);
    return new Promise((resolve, reject) => {
        fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + from + '&tl=' + to + '&dt=t&q=' + encodeURI(text))
            .then(response => response.json())
            .then(data => {
                let d = data[0].map(x=>x[0]).join('\n')
                // let d = data[0][0][0];
                resolve(d);

            });
    });
}
async function translate(text, from, to) {
    if (!canTranslate(text)) {
        console.log("CANNOT TRANSLATE:", text);
        return text;
    }
    let d = await translateTextFromGoogle(text, from, to);

    return d;
}

//regex matches text between ] and [

//replace matched text with translated text async

async function translateAttributes(content, from, to) {
    console.log("translateAttributes");
    const regex = /(?<name>\w+)="(?<value>.*?)"/g;
    return stringReplaceAsync(content, regex, async (match, name, value, offset, string, groups) => {
        let translated = await translate(value, from, to);
        if (translated != value) {
            console.log("TRANSLATE FROM:", value, "\n TO:", translated);
            value = translated;
        }
        return `${name}="${value}"}`;
    });
}
async function translateContent(content, from, to) {
    console.log("translateContent");
    const regex = /(?<g1>\])(?<text>[\s\S]*?)(?<g2>\[)/g;

    return stringReplaceAsync(content, regex, async (match, g1, text, g2, offset, string, groups) => {
        let translated = await translate(text, from, to);
        if (translated != text) {
            console.log("TRANSLATE FROM:", text, "\n TO:", translated);
            text = translated;
        }
        return g1 + text + g2;
    });
}

export default function (content, from, to) {
    return translateContent(content, from, to)
        .then((content) => translateAttributes(content, from, to));
}
