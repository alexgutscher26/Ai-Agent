
import { prisma } from "../lib/db";

async function main() {
    console.log("Verifying Tip model...");
    try {
        const tips = await prisma.tip.count();
        console.log(`Tip count: ${tips}`);
        console.log("Verification successful: Tip model is accessible.");
    } catch (e) {
        console.error("Verification failed:", e);
        process.exit(1);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
