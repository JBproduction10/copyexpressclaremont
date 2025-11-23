import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PDFParse } from 'pdf-parse';
import type { TextResult } from 'pdf-parse';

export const runtime = 'nodejs';

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

    // Initialize PDF parser
    parser = new PDFParse({ data: buffer });

    // Extract text
    const result: TextResult = await parser.getText();
    const info = await parser.getInfo();

    // Parse the extracted text into structured data
    const parsedData = parsePricingData(result.text);

    return NextResponse.json({
      success: true,
      data: {
        rawText: result.text,
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
    if (parser) {
      await parser.destroy();
    }
  }
}

// Parse pricing data from extracted text
function parsePricingData(text: string) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const data: Array<Record<string, string>> = [];
  const columns: Array<{ key: string; label: string; sublabel?: string }> = [];
  
  // Detect table structure
  let headerLine = '';
  let isTableSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect headers (lines with multiple column names)
    if (line.includes('GSM') || line.includes('Qty') || line.includes('Quantity')) {
      headerLine = line;
      isTableSection = true;
      
      // Parse column headers
      const headers = line.split(/\s{2,}|\t/); // Split by multiple spaces or tabs
      headers.forEach((header, idx) => {
        const cleanHeader = header.trim();
        if (cleanHeader) {
          columns.push({
            key: `col_${idx}`,
            label: cleanHeader,
          });
        }
      });
      continue;
    }
    
    // Parse data rows
    if (isTableSection && line.match(/\d/)) {
      const values = line.split(/\s{2,}|\t/);
      const row: Record<string, string> = {};
      
      values.forEach((value, idx) => {
        const cleanValue = value.trim();
        if (cleanValue && columns[idx]) {
          row[columns[idx].key] = cleanValue;
        }
      });
      
      if (Object.keys(row).length > 0) {
        data.push(row);
      }
    }
    
    // Detect end of table
    if (isTableSection && line.match(/^(Note|Notes|Additional|Minimum):/i)) {
      isTableSection = false;
    }
  }
  
  return {
    columns,
    data,
    suggestions: {
      categoryName: detectCategoryName(text),
      subcategoryName: detectSubcategoryName(text),
      type: data.length > 0 ? 'table' : 'image-gallery',
    },
  };
}

function detectCategoryName(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  // Look for title-like lines (all caps or title case at the start)
  for (const line of lines.slice(0, 10)) {
    if (line === line.toUpperCase() && line.length > 5 && line.length < 50) {
      return line;
    }
  }
  return 'New Category';
}

function detectSubcategoryName(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  // Look for subtitle-like lines
  for (let i = 1; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    if (line.length > 5 && line.length < 60 && !line.match(/^(Note|Price|R\d)/)) {
      return line;
    }
  }
  return 'New Subcategory';
}