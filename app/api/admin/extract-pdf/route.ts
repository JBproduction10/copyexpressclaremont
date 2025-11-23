import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PDFParse } from 'pdf-parse';
import type { TextResult } from 'pdf-parse';

export const runtime = 'nodejs';

// POST extract data from PDF
export async function POST(req: NextRequest) {
  let parser: PDFParse | null = null;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Initialize PDF parser with buffer
    parser = new PDFParse({ data: buffer });

    // Extract text from PDF
    const result: TextResult = await parser.getText();

    // Get PDF info for page count
    const info = await parser.getInfo();

    // Extract text content
    const extractedText = result.text;

    // Parse the text to extract pricing data
    const parsedData = parsePricingData(extractedText);

    return NextResponse.json({
      success: true,
      data: {
        rawText: extractedText,
        parsedData,
        pages: info.total,
      },
    });
  } catch (error: unknown) {
    console.error('Error extracting PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to extract PDF data' },
      { status: 500 }
    );
  } finally {
    // Always destroy the parser to free memory
    if (parser) {
      await parser.destroy();
    }
  }
}

// Helper function to parse pricing data from extracted text
function parsePricingData(text: string) {
  const lines = text.split('\n');
  const data: Record<string, unknown>[] = [];

  const pricePattern = /R[\d,.]+/g;

  lines.forEach((line) => {
    const prices = line.match(pricePattern);
    if (prices && prices.length > 0) {
      const parts = line.split(/\s+/);
      const row: Record<string, string> = {};

      const nonPriceParts = parts.filter(part => !part.match(/^R[\d,.]+$/));
      if (nonPriceParts.length > 0) {
        row.qty = nonPriceParts.join(' ');
      }

      prices.forEach((price, index) => {
        row[`price_${index + 1}`] = price;
      });

      if (Object.keys(row).length > 1) {
        data.push(row);
      }
    }
  });

  return data; // return everything
}