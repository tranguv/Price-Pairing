import { Cheerio, Element } from "cheerio";
import { PriceHistoryItem, Product } from "@/types";
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
    const discountRateText = elements.text().split("-")[1]
    if (discountRateText) {
        discountRateText.replace(/[-%]/g, "");
    }
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

export async function findLowestPrice(priceHistory: PriceHistoryItem[]) {
    if (priceHistory.length == 0) {
        return -1;
    }

    let lowestPrice = priceHistory[0];

    for (const priceItem of priceHistory) {
        if (priceItem.price < lowestPrice.price) {
            lowestPrice.price = priceItem.price;
        }
    }

    return lowestPrice.price
}

export async function findHighestPrice(priceHistory: PriceHistoryItem[]) {
    if (priceHistory.length == 0) {
        return -1;
    }

    let highestPrice = priceHistory[0];

    for (const priceItem of priceHistory) {
        if (priceItem.price > highestPrice.price) {
            highestPrice.price = priceItem.price;
        }
    }

    return highestPrice.price
}

export function getAveragePrice(priceList: PriceHistoryItem[]) {
    const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
    const averagePrice = sumOfPrices / priceList.length || 0;

    return averagePrice;
}

export const formatNumber = (num: number = 0) => {
    return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

const Notification = {
    WELCOME: 'WELCOME',
    CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
    LOWEST_PRICE: 'LOWEST_PRICE',
    THRESHOLD_MET: 'THRESHOLD_MET',
}

const THRESHOLD_PERCENTAGE = 40;

export const getEmailNotifType = async (
    scrapedProduct: Product,
    currentProduct: Product
) => {
    const lowestPrice = await findLowestPrice(currentProduct.priceHistory);

    if (scrapedProduct.currentPrice < lowestPrice) {
        return Notification.LOWEST_PRICE as keyof typeof Notification;
    }
    if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
        return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
    }
    if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
        return Notification.THRESHOLD_MET as keyof typeof Notification;
    }

    return null;
};
