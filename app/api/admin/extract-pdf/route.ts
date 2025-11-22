import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import PdfParse from "pdf-parse";


// POST extract data from  PDF
export async function POST(req: NextRequest){
    try{
        const session = await getServerSession(authOptions);

        if(!session){
            return NextResponse.json(
                {success: false, error: 'Unauthorized'},
                {status: 401}
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if(!file){
            return NextResponse.json(
                {success: false, error: 'No file provided'},
                {status: 400}
            );
        }

        if(file.type !== 'application/pdf'){
            return NextResponse.json(
                {success: false, error: 'File must be a PDF'},
                {status: 400}
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const pdfData = await PdfParse(buffer);

        // Extract text content
        const extractedText = pdfData.text;

        // Parse the text to extract pricing data
        const parsedData = parsePricingData(extractedText);

        return NextResponse.json({
            success: true,
            data: {
                rawText: extractedText,
                parsedData,
                pages: pdfData.numpages
            },
        });
    }catch(error: unknown){
        console.error('Error extracting PDF:', error);
        return NextResponse.json(
            {success: false, error: 'Failed to extract PDF data'},
            {status: 500}
        );
    }
}

// Helper function to parse pricing data from extracted text
function parsePricingData(text:string){
    const lines = text.split('\n');
    const data: Record<string, unknown>[] = [];

    // This is a basic parser - you may need to customize based on your PDF format
    // It attemps to extract rows of data that contain price information

    const pricePattern = /R[\d,.]+/g;

    lines.forEach((line) => {
        const prices = line.match(pricePattern);
        if(prices && prices.length > 0) {
            // Extract quantity or description from the line
            const parts = line.split(/\s+/);
            const row: Record<string, string> = {};

            // Try to identify the quantify/description
            const nonPriceParts = parts.filter(part => !part.match(/^R[\d,.]+$/));
            if (nonPriceParts.length > 0) {
                row.qty = nonPriceParts.join(' ');
            }

            // Add prices
            prices.forEach((price, index) => {
                row[`price_${index + 1}`] = price;
            });

            if(Object.keys(row).length > 1){
                data.push(row);
            }
        }
    });

    return data;
}