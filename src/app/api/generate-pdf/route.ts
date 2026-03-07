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
    const stripEmojis = (str: string) => str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{1F004}]/gu, '').trim();
    
    const safeAnswers = answers.map(a => ({
      ...a,
      section: stripEmojis(a.section),
      question: stripEmojis(a.question),
      answer: stripEmojis(a.answer)
    }))

    // Generate PDF natively using pdf-lib
    const pdfBytes = await generatePDFNative(safeAnswers)
    
    // Return PDF as response
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="questionario-reabilitacao.pdf"'
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

async function generatePDFNative(answers: Answer[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  
  // Set Metadata
  pdfDoc.setTitle('Questionario - Gestao da Clinica de Reabilitacao')
  pdfDoc.setAuthor('Rob Dev')
  pdfDoc.setCreator('Rob Silva')
  pdfDoc.setSubject('Formulario Digital - Respostas do Questionario')

  // Load Fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  let page = pdfDoc.addPage([595.28, 841.89]) // A4 size
  let cursorY = page.getHeight() - 50
  const margin = 50

  const drawText = (text: string, size: number, font: any, color: any, xOffset = 0) => {
    // Simple text wrapping mechanism
    const words = text.split(' ')
    let line = ''
    let y = cursorY

    for (const word of words) {
      const testLine = line + word + ' '
      const textWidth = font.widthOfTextAtSize(testLine, size)
      if (margin + xOffset + textWidth > page.getWidth() - margin) {
        page.drawText(line, { x: margin + xOffset, y, size, font, color })
        line = word + ' '
        y -= size + 4
      } else {
        line = testLine
      }
    }
    page.drawText(line, { x: margin + xOffset, y, size, font, color })
    cursorY = y - (size + 10)
  }

  const checkPageBreak = (neededSpace: number) => {
    if (cursorY - neededSpace < margin) {
      page = pdfDoc.addPage([595.28, 841.89])
      cursorY = page.getHeight() - margin
    }
  }

  // Draw Brand Header
  drawText('ROB DEV', 16, fontBold, rgb(0.145, 0.388, 0.922))
  cursorY += 8
  drawText('Desenvolvedor', 10, fontRegular, rgb(0.42, 0.447, 0.502))
  cursorY -= 15
  checkPageBreak(30)

  // Title
  drawText('Gestao da Clinica de Reabilitacao', 20, fontBold, rgb(0.066, 0.094, 0.153))
  cursorY += 8
  drawText('Questionario Respondido', 12, fontRegular, rgb(0.42, 0.447, 0.502))
  cursorY -= 20
  checkPageBreak(20)

  // Group answers by section
  let currentSection = null
  for (const item of answers) {
    if (item.section !== currentSection) {
      currentSection = item.section
      checkPageBreak(40)
      drawText(currentSection, 14, fontBold, rgb(0.145, 0.388, 0.922))
      cursorY -= 5
    }

    checkPageBreak(50)
    // Question
    const questionText = `${item.number}. ${item.question}`
    drawText(questionText, 10, fontBold, rgb(0.42, 0.447, 0.502), 10)
    cursorY += 5
    
    // Answer
    const answerText = item.answer && item.answer !== 'Nao informado' ? item.answer : 'Nao informado'
    drawText(answerText, 11, fontRegular, rgb(0.066, 0.094, 0.153), 10)
    cursorY -= 10
  }

  // Footer
  const dateStr = new Date().toLocaleString('pt-BR')
  checkPageBreak(60)
  drawText(`Gerado em ${dateStr}`, 9, fontRegular, rgb(0.612, 0.639, 0.686))
  cursorY += 5
  drawText('Desenvolvido por Rob Silva', 9, fontRegular, rgb(0.612, 0.639, 0.686))
  cursorY += 5
  drawText('linkedin.com/in/robsilva1', 9, fontRegular, rgb(0.145, 0.388, 0.922))

  return await pdfDoc.save()
}
