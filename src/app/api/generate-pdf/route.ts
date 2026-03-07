import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface Answer {
  section: string
  question: string
  answer: string
  number: number
}

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json() as { answers: Answer[] }

    // Strip emojis because pdf-lib default fonts (WinAnsi) don't support them
    const stripEmojis = (str: string) => str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{1F004}\u{FE0F}\u{200D}]/gu, '').trim();

    const safeAnswers = answers.map(a => ({
      ...a,
      section: stripEmojis(a.section),
      question: stripEmojis(a.question),
      answer: stripEmojis(a.answer)
    }))

    const pdfBytes = await generatePDFNative(safeAnswers)

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="formulario-clinica.pdf"'
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar PDF' },
      { status: 500 }
    )
  }
}

// Colors
const blue = rgb(0.145, 0.388, 0.922)
const darkBlue = rgb(0.08, 0.16, 0.36)
const dark = rgb(0.12, 0.12, 0.14)
const gray = rgb(0.42, 0.45, 0.50)
const lightGray = rgb(0.92, 0.93, 0.95)
const white = rgb(1, 1, 1)
const softBlue = rgb(0.93, 0.95, 1)

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 48
const CONTENT_W = PAGE_W - MARGIN * 2

async function generatePDFNative(answers: Answer[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()

  pdfDoc.setTitle('Formulario - Gestao da Clinica de Reabilitacao')
  pdfDoc.setAuthor('Rob Dev')
  pdfDoc.setCreator('Rob Silva')
  pdfDoc.setSubject('Formulario Digital - Respostas do Questionario')

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page = pdfDoc.addPage([PAGE_W, PAGE_H])
  let cursorY = PAGE_H - MARGIN
  let pageNum = 1

  // --- Helpers ---
  const drawWrappedText = (text: string, size: number, font: typeof fontRegular, color: ReturnType<typeof rgb>, xOffset = 0, lineHeight = size + 5) => {
    const maxWidth = CONTENT_W - xOffset
    const words = text.split(' ')
    let line = ''
    let y = cursorY

    for (const word of words) {
      const testLine = line + word + ' '
      if (font.widthOfTextAtSize(testLine, size) > maxWidth && line.length > 0) {
        page.drawText(line.trimEnd(), { x: MARGIN + xOffset, y, size, font, color })
        line = word + ' '
        y -= lineHeight
      } else {
        line = testLine
      }
    }
    if (line.trim()) {
      page.drawText(line.trimEnd(), { x: MARGIN + xOffset, y, size, font, color })
    }
    cursorY = y - lineHeight
  }

  const checkPageBreak = (needed: number) => {
    if (cursorY - needed < MARGIN + 40) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H])
      pageNum++
      cursorY = PAGE_H - MARGIN
    }
  }

  const drawHorizontalLine = (y: number, color: ReturnType<typeof rgb> = lightGray, height = 0.75) => {
    page.drawRectangle({ x: MARGIN, y, width: CONTENT_W, height, color })
  }

  // ============================
  // HEADER - Blue accent bar
  // ============================
  page.drawRectangle({
    x: 0, y: PAGE_H - 6, width: PAGE_W, height: 6, color: blue
  })

  cursorY = PAGE_H - 52

  // Brand
  page.drawText('ROB DEV', { x: MARGIN, y: cursorY, size: 22, font: fontBold, color: blue })
  const tagW = fontRegular.widthOfTextAtSize('Desenvolvedor', 9)
  page.drawText('Desenvolvedor', { x: PAGE_W - MARGIN - tagW, y: cursorY + 6, size: 9, font: fontRegular, color: gray })
  cursorY -= 18

  drawHorizontalLine(cursorY, lightGray, 1)
  cursorY -= 28

  // Title block
  page.drawText('Gestao da Clinica', { x: MARGIN, y: cursorY, size: 24, font: fontBold, color: darkBlue })
  cursorY -= 28
  page.drawText('de Reabilitacao', { x: MARGIN, y: cursorY, size: 24, font: fontBold, color: darkBlue })
  cursorY -= 26
  page.drawText('Questionario Respondido', { x: MARGIN, y: cursorY, size: 11, font: fontRegular, color: gray })
  cursorY -= 24

  // Date pill
  const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const dateFull = `Data: ${dateStr}`
  const dateTw = fontRegular.widthOfTextAtSize(dateFull, 9)
  page.drawRectangle({
    x: MARGIN, y: cursorY - 4, width: dateTw + 16, height: 18, color: softBlue,
    borderColor: blue, borderWidth: 0.5
  })
  page.drawText(dateFull, { x: MARGIN + 8, y: cursorY, size: 9, font: fontRegular, color: darkBlue })
  cursorY -= 36

  drawHorizontalLine(cursorY, blue, 1.5)
  cursorY -= 30

  // ============================
  // CONTENT - Sections & Answers
  // ============================
  let currentSection: string | null = null
  let sectionIndex = 0

  for (const item of answers) {
    // Section header
    if (item.section !== currentSection) {
      currentSection = item.section
      sectionIndex++

      checkPageBreak(70)

      // Section background bar
      page.drawRectangle({
        x: MARGIN, y: cursorY - 4, width: CONTENT_W, height: 24, color: darkBlue
      })
      // Small accent on the left
      page.drawRectangle({
        x: MARGIN, y: cursorY - 4, width: 4, height: 24, color: blue
      })
      page.drawText(`${sectionIndex}. ${currentSection}`.toUpperCase(), {
        x: MARGIN + 14, y: cursorY + 2, size: 10, font: fontBold, color: white
      })
      cursorY -= 38
    }

    checkPageBreak(60)

    // Question number badge
    const badgeText = `${item.number}`
    const badgeW = fontBold.widthOfTextAtSize(badgeText, 8) + 12
    page.drawRectangle({
      x: MARGIN, y: cursorY - 2, width: badgeW, height: 16, color: softBlue
    })
    page.drawText(badgeText, {
      x: MARGIN + 6, y: cursorY + 1, size: 8, font: fontBold, color: blue
    })

    // Question text
    const qX = MARGIN + badgeW + 6
    const qMaxW = CONTENT_W - badgeW - 6
    const qWords = item.question.split(' ')
    let qLine = ''
    let qY = cursorY + 1
    for (const word of qWords) {
      const testLine = qLine + word + ' '
      if (fontBold.widthOfTextAtSize(testLine, 9.5) > qMaxW && qLine.length > 0) {
        page.drawText(qLine.trimEnd(), { x: qX, y: qY, size: 9.5, font: fontBold, color: gray })
        qLine = word + ' '
        qY -= 13
      } else {
        qLine = testLine
      }
    }
    if (qLine.trim()) {
      page.drawText(qLine.trimEnd(), { x: qX, y: qY, size: 9.5, font: fontBold, color: gray })
    }
    cursorY = qY - 16

    // Answer card
    const isUnanswered = !item.answer || item.answer === 'Nao informado'
    const answerText = isUnanswered ? 'Nao informado' : item.answer
    const answerColor = isUnanswered ? gray : dark
    const answerBg = isUnanswered ? lightGray : softBlue

    // Measure answer height
    const aWords = answerText.split(' ')
    let aLineCount = 1
    let aLine = ''
    const aMaxW = CONTENT_W - 28
    for (const word of aWords) {
      const testLine = aLine + word + ' '
      if (fontRegular.widthOfTextAtSize(testLine, 10.5) > aMaxW && aLine.length > 0) {
        aLineCount++
        aLine = word + ' '
      } else {
        aLine = testLine
      }
    }
    const cardH = aLineCount * 15 + 14

    checkPageBreak(cardH + 10)

    // Card background
    page.drawRectangle({
      x: MARGIN + 8, y: cursorY - cardH + 14, width: CONTENT_W - 16, height: cardH, color: answerBg
    })
    // Left accent bar on card
    if (!isUnanswered) {
      page.drawRectangle({
        x: MARGIN + 8, y: cursorY - cardH + 14, width: 3, height: cardH, color: blue
      })
    }

    // Draw answer text
    cursorY -= 0
    drawWrappedText(answerText, 10.5, fontRegular, answerColor, 20, 15)
    cursorY -= 10

    // Subtle separator
    drawHorizontalLine(cursorY + 4, lightGray, 0.5)
    cursorY -= 8
  }

  // ============================
  // FOOTER on last page
  // ============================
  checkPageBreak(80)

  cursorY -= 10
  drawHorizontalLine(cursorY, blue, 1.5)
  cursorY -= 24

  page.drawText('Desenvolvido por', { x: MARGIN, y: cursorY, size: 9, font: fontRegular, color: gray })
  cursorY -= 16
  page.drawText('Rob Silva', { x: MARGIN, y: cursorY, size: 13, font: fontBold, color: darkBlue })
  cursorY -= 16
  page.drawText('linkedin.com/in/robsilva1', { x: MARGIN, y: cursorY, size: 9, font: fontRegular, color: blue })

  // Draw footer on all pages
  const pages = pdfDoc.getPages()
  const totalPages = pages.length
  for (let i = 0; i < totalPages; i++) {
    const p = pages[i]
    // Bottom line
    p.drawRectangle({ x: MARGIN, y: 32, width: CONTENT_W, height: 0.5, color: lightGray })
    // Page number
    const pText = `${i + 1} / ${totalPages}`
    const ptw = fontRegular.widthOfTextAtSize(pText, 8)
    p.drawText(pText, { x: PAGE_W / 2 - ptw / 2, y: 18, size: 8, font: fontRegular, color: gray })
    // Brand
    p.drawText('Rob Dev', { x: MARGIN, y: 18, size: 8, font: fontBold, color: blue })
    // Date
    const dFooter = new Date().toLocaleDateString('pt-BR')
    const dfw = fontRegular.widthOfTextAtSize(dFooter, 8)
    p.drawText(dFooter, { x: PAGE_W - MARGIN - dfw, y: 18, size: 8, font: fontRegular, color: gray })
    // Bottom accent bar
    p.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 4, color: blue })
  }

  return await pdfDoc.save()
}
