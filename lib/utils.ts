import { Cheerio, Element } from "cheerio";

export async function extractPrice(...elements: Cheerio<Element>[]) {
    for (const element of elements) {
        // console.log("e ", element);
        const priceText = element.text().trim();
        // console.log("pricetext", priceText);
        if (priceText) {
            const cleanPrice = priceText.replace(/[^\d.]/g, '');

            let firstPrice;

            if (cleanPrice) {
                firstPrice = cleanPrice.match(/\d+\.\d{2}/)?.[0];
            }

            return firstPrice || cleanPrice;
        }
    }

    return '';
}

export async function extractCurrentPrice(...elements: Cheerio<Element>[]) {
    for (const element of elements) {
        // console.log("e ", element.text());
        const priceText = element.text().trim();
        // console.log("pricetext", priceText);
        if (priceText) {
            const cleanPrice = priceText.replace(/[^\d.]/g, '');

            let firstPrice;

            if (cleanPrice) {
                firstPrice = cleanPrice.match(/\d+\.\d{2}/)?.[0];
            }

            return firstPrice || cleanPrice;
        }
    }

    return '';
}


export async function extractCurrency(element: Cheerio<Element>) {
    const currencyText = element.text().trim().slice(0, 1);
    return currencyText ? currencyText : '';
}

export async function extractDiscountRate(elements: Cheerio<Element>) {
    console.log("b4 ", elements.text())
    const discountRateText = elements.text().split("-")[1]
    if (discountRateText) {
        discountRateText.replace(/[-%]/g, "");
    }
    console.log("after prep", discountRateText)
    return discountRateText ? discountRateText : '';
}

export async function extractCategory(element: Cheerio<Element>): Promise<string> {
    let result = "";
    const categoryText = element.text().trim().split("\n");

    for (let i = 0; i < categoryText.length; i += 2) {
        result += categoryText[i].trim();
        if (i != categoryText.length - 2) {
            result += "; "
        }

    }
    return result;
}

export function extractDescription($: any) {
    // these are possible elements holding description of the product
    const selectors = [
        ".a-unordered-list .a-list-item",
        ".a-expander-content p",
        // Add more selectors here if needed
    ];

    for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
            const textContent = elements
                .map((_: any, element: any) => $(element).text().trim())
                .get()
                .join("\n");
            return textContent;
        }
    }
}