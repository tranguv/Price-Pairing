import { findLowestPrice, findHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

export async function getUpdatedProducts() {
  try {
    connectToDB();

    const products = await Product.find({});
    if (!products) throw new Error("No products fetched");

    // Scrape product details and update the database
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
        if (!scrapedProduct) return;

        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: findLowestPrice(updatedPriceHistory),
          highestPrice: findHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        const updatedProduct = await Product.findOneAndUpdate(
          { url: product.url },
          product
        );

        // Check product status and send email notifications
        const emailNotifType = await getEmailNotifType(scrapedProduct, currentProduct);
        if (emailNotifType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };
          const emailContent = await generateEmailBody(productInfo, emailNotifType);
          const userEmails = updatedProduct.users.map((user: { email: any; }) => user.email);
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    console.log("Products updated successfully:", updatedProducts);
  } catch (error: any) {
    console.error(`Failed to update products: ${error.message}`);
  }
}
