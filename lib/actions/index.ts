"use server"

import { revalidatePath } from "next/cache";
import { EmailContent, PriceHistoryItem, User } from "@/types";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { findHighestPrice, findLowestPrice, getAveragePrice } from "../utils";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(productUrl: string) {
    if (!productUrl) {
        return;
    }

    try {
        connectToDB();
        const scrapedproduct = await scrapeAmazonProduct(productUrl);

        if (!scrapedproduct) return;

        let product = scrapedproduct;

        const existingProduct = await Product.findOne({
            url: scrapedproduct.url
        })

        if (existingProduct) {
            const updatedPriceHistory: any = [
                ...existingProduct.priceHistory,
                { price: scrapedproduct.currentPrice }
            ]


            product = {
                ...scrapedproduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: await findLowestPrice(updatedPriceHistory),
                highestPrice: await findHighestPrice(updatedPriceHistory),
                averagePrice: await getAveragePrice(updatedPriceHistory)
            }
        }

        const newProduct = await Product.findOneAndUpdate(
            {
                url: scrapedproduct.url
            },
            product,
            { upsert: true, new: true } // if doesnt exist create one
        )

        revalidatePath(`/products/${newProduct._id}`)
    } catch (error) {
        throw new Error(`Failer to create/update product: ${error}`)
    }
}

export async function getProductById(productId: string) {
    try {
        connectToDB();
        let product = await Product.findOne({
            _id: productId
        })

        if (!product) return null;
        return product;
    } catch (error) {
        console.log("error fetch produbt by id: ", error);
    }

}

export async function getAllProduct() {
    try {
        connectToDB();
        const allProductList = await Product.find();

        return allProductList;
    } catch (error) {
        console.log(error)
    }
}

export async function getSimilarProduct(productId: String) {
    try {
        connectToDB();
        const currentProduct = await Product.findById(productId);

        if (!currentProduct) return null;

        const similarProduct = await Product.find({
            _id: { $ne: productId }
        }).limit(3);
        return currentProduct;
    } catch (error) {
        console.log(error)
    }
}


export async function addUserEmailToProduct(productId: string, userEmail: string) {
    try {
        const product = await Product.findById(productId);

        if (!product) return;

        const userExists = product.users.some((user: User) => user.email === userEmail);

        if (!userExists) {
            product.users.push({ email: userEmail });

            await product.save();

            const emailContent = await generateEmailBody(product, "WELCOME");

            await sendEmail(emailContent, [userEmail]);
        }
    } catch (error) {
        console.log(error)
    }
}


