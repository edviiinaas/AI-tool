import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
// @ts-ignore
import fs from 'fs'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function extractFromPDF(filePath: string) {
  const dataBuffer = fs.readFileSync(filePath)
  const data = await pdfParse(dataBuffer)
  return { text: data.text, images: [] } // TODO: extract images if needed
}

async function extractFromDOCX(filePath: string) {
  const data = await mammoth.extractRawText({ path: filePath })
  return { text: data.value, images: [] } // TODO: extract images if needed
}

async function extractFromXLSX(filePath: string) {
  const workbook = XLSX.readFile(filePath)
  let text = ''
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName]
    text += XLSX.utils.sheet_to_csv(sheet)
  })
  return { text, images: [] }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if ((req as any).method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const form = new formidable.IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing file' })
    }
    try {
      const results = []
      for (const key in files) {
        const file = Array.isArray(files[key]) ? files[key][0] : files[key]
        if (!file) continue
        const filePath = (file as any).filepath || (file as any).path
        const fileType = (file as any).mimetype || (file as any).type
        let extracted = { text: '', images: [] as any[] }
        if (fileType === 'application/pdf') {
          extracted = await extractFromPDF(filePath)
        } else if (
          fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileType === 'application/msword'
        ) {
          extracted = await extractFromDOCX(filePath)
        } else if (
          fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          fileType === 'application/vnd.ms-excel'
        ) {
          extracted = await extractFromXLSX(filePath)
        } else {
          // fallback: just read as text
          extracted.text = fs.readFileSync(filePath, 'utf8')
        }
        results.push({
          originalName: file.originalFilename,
          extractedText: extracted.text,
          extractedImages: extracted.images,
          fileType,
        })
        // Optionally, delete the temp file
        fs.unlinkSync(filePath)
      }
      res.status(200).json({ files: results })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  })
} 