import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Type for text content items
interface TextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
}

interface TextMarkedContent {
  type: string;
}

// POST extract data from PDF
export async function POST(req: NextRequest) {
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
    const typedArray = new Uint8Array(arrayBuffer);

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: typedArray });
    const pdf = await loadingTask.promise;

    let fullText = '';
    const numPages = pdf.numPages;

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Extract text from items
      const pageText = textContent.items
        .map((item) => {
          if ('str' in item) {
            return (item as TextItem).str;
          }
          return '';
        })
        .join(' ');
      
      fullText += pageText + '\n';
    }

    // Parse the text to extract pricing data
    const parsedData = parsePricingData(fullText);

    return NextResponse.json({
      success: true,
      data: {
        rawText: fullText,
        parsedData,
        pages: numPages,
      },
    });
  } catch (error: unknown) {
    console.error('Error extracting PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to extract PDF data' },
      { status: 500 }
    );
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

  return data;
}