

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

function translateTextFromGoogle(text, from, to) {
    return new Promise((resolve, reject) => {
        fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + from + '&tl=' + to + '&dt=t&q=' + encodeURI(text))
            .then(response => response.json())
            .then(data => {
                let d = data[0][0][0];
                console.log(d);
                resolve(d);

            });
    });
}
async function translate(text, from, to) {
    if (!canTranslate(text)) {
        return text;
    }
    let d = await translateTextFromGoogle(text, from, to);

    return d;
}

//regex matches text between ] and [

//replace matched text with translated text async

async function translateAttributes(content, from, to) {
    console.log("translateAttributes");
    const regex = /(\w+)="(.*?)"/g;
    let m;
    while ((m = regex.exec(content)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // replace only value
        for (let i = 2; i < m.length; i++) {
            let text = m[i];
            if (text.length > 0) {
                let translated = await translate(text, from, to);
                console.log(text, translated);
                content = content.replace(text, translated);
            }
        }
    }
    return content;
}
async function translateContent(content, from, to) {
    console.log("translateContent");
    const regex = /\](.*?)\[/g;
    let m;
    while ((m = regex.exec(content)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        for (let i = 1; i < m.length; i++) {
            let text = m[i];
            if (text.length > 0) {
                let translated = await translate(text, from, to);
                console.log(text, translated);
                content = content.replace(text, translated);
            }
        }
    }

    return content;
}

export default function (content, from, to) {
    return translateContent(content, from, to)
        .then(translateAttributes, from, to);
}
