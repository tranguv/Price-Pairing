import axios from "axios";
import * as cheerio from 'cheerio'
import { extractCategory, extractCurrency, extractCurrentPrice, extractDescription, extractDiscountRate, extractPrice, findLowestPrice } from "../utils";
import { PriceHistoryItem } from "@/types";
export async function scrapeAmazonProduct(url: string) {
    if (!url) return;

    //Brightdata proxy configuration
    const username = String(process.env.BRIGHTDATA_USERNAME);
    const password = String(process.env.BRIGHTDATA_PASSWORD);
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;

    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }

    try {
        // Fetch the product page
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);

        let priceHistory: PriceHistoryItem[] = [];

        // Extract the product title
        const title = $('#productTitle').text().trim();
        // let priceHistory = [];
        const currentPrice = await extractCurrentPrice(
            $('.priceToPay'),
            $('span.a-price .a-offscreen'),
            $('.a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
        );

        const originalPrice = await extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        );

        const outOfStock = await $('#availability .a-size-medium.a-color-success').text().trim().split("  ")[0].toLowerCase() === 'currently unvailable';

        const images = $('#imgBlkFront').attr('data-a-dynamic-image') ||
            $('#landingImage').attr('data-a-dynamic-image') ||
            '{}';

        const imageUrls = Object.keys(JSON.parse(images));

        const currency = await extractCurrency($('.a-price-symbol'));

        const discountRate = await extractDiscountRate($('.savingsPercentage'));

        const description = extractDescription($);

        const category = await extractCategory($('#wayfinding-breadcrumbs_feature_div a'));

        const reviewCount = $('#acrCustomerReviewText').text().split(" ")[0];

        const stars = $('i.a-icon-star span.a-icon-alt').text().trim().split(" ")
        let starValue = null;
        if (stars.length > 1) {
            starValue = stars[0]
        }

        const lowestPrice = findLowestPrice(priceHistory);
        console.log(stars);
        // comnstruct data object

        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            category: category || "Unknown",
            reviewsCount: Number(reviewCount) || 0,
            stars: Number(stars) || 0,
            isOutOfStock: outOfStock,
            description: description || "Description not available",
            lowestPrice: Number(currentPrice) || Number(currentPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(currentPrice),
        }

        return data;
    } catch (error: any) {
        throw new Error(`Failed to scrape: ${error}`)
    }
}