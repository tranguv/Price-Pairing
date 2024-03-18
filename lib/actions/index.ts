"use server"

import { scrapeAmazonProduct } from "../scraper";

export async function scrapeAndStoreProduct(productUrl: string) {
    if(!productUrl){
        return;
    }

    try {
        const scrapedproduct = await scrapeAmazonProduct(productUrl);
    } catch (error) {
        throw new Error(`Failer to create/update product: ${error}`)
    }
    
}