import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface Answer {
  section: string
  question: string
  answer: string
  number: number
}

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json() as { answers: Answer[] }

    // Generate PDF using Python script
    const pdfContent = generatePDFContent(answers)
    
    // Return PDF as response
    return new NextResponse(pdfContent, {
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

function generatePDFContent(answers: Answer[]): Buffer {
  // Create temporary JSON file with answers
  const tempDir = '/tmp'
  const timestamp = Date.now()
  const jsonPath = path.join(tempDir, `answers_${timestamp}.json`)
  const pdfPath = path.join(tempDir, `questionario_${timestamp}.pdf`)
  
  fs.writeFileSync(jsonPath, JSON.stringify(answers, null, 2))
  
  // Python script to generate PDF with Rob Dev branding
  const pythonScript = `
# -*- coding: utf-8 -*-
import json
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib.units import cm
from pypdf import PdfReader, PdfWriter

# Read answers
with open('${jsonPath}', 'r', encoding='utf-8') as f:
    answers = json.load(f)

# Create PDF
doc = SimpleDocTemplate(
    '${pdfPath}',
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2.5*cm,
    title='Questionario - Gestao da Clinica de Reabilitacao',
    author='Rob Dev',
    creator='Rob Silva',
    subject='Formulario Digital - Respostas do Questionario'
)

# Styles
styles = getSampleStyleSheet()

# Brand style
brand_style = ParagraphStyle(
    'BrandStyle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=14,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#2563EB')
)

brand_subtitle = ParagraphStyle(
    'BrandSubtitle',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#6B7280')
)

title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=20,
    spaceAfter=4,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#111827')
)
subtitle_style = ParagraphStyle(
    'CustomSubtitle',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=10,
    spaceAfter=20,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#6B7280')
)
section_style = ParagraphStyle(
    'SectionStyle',
    parent=styles['Heading2'],
    fontName='Helvetica-Bold',
    fontSize=12,
    spaceBefore=16,
    spaceAfter=10,
    textColor=colors.HexColor('#2563EB')
)
question_style = ParagraphStyle(
    'QuestionStyle',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9,
    textColor=colors.HexColor('#6B7280'),
    spaceAfter=3,
    leftIndent=8
)
answer_style = ParagraphStyle(
    'AnswerStyle',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=10,
    textColor=colors.HexColor('#111827'),
    spaceAfter=14,
    leftIndent=8
)
footer_style = ParagraphStyle(
    'FooterStyle',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#9CA3AF')
)
linkedin_style = ParagraphStyle(
    'LinkedInStyle',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#2563EB')
)

story = []

# Brand Header
story.append(Spacer(1, 10))
story.append(Paragraph('ROB DEV', brand_style))
story.append(Paragraph('Desenvolvedor', brand_subtitle))
story.append(Spacer(1, 15))

# Divider
story.append(HRFlowable(width='100%', thickness=2, color=colors.HexColor('#2563EB'), spaceAfter=20))

# Title
story.append(Paragraph('Gestao da Clinica de Reabilitacao', title_style))
story.append(Paragraph('Questionario Respondido', subtitle_style))

# Divider
story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#E5E7EB'), spaceAfter=15))

# Group answers by section
current_section = None

for item in answers:
    # Check if section changed
    if item['section'] != current_section:
        current_section = item['section']
        story.append(Paragraph(current_section, section_style))
    
    # Question number from the data
    question_num = item['number']
    
    # Question
    question_text = f"<font color='#6B7280'>{question_num}.</font> {item['question']}"
    story.append(Paragraph(question_text, question_style))
    
    # Answer
    answer_text = item['answer'] if item['answer'] and item['answer'] != 'Nao informado' else '<i>Nao informado</i>'
    story.append(Paragraph(answer_text, answer_style))

story.append(Spacer(1, 15))
story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#E5E7EB'), spaceAfter=15))

# Footer
story.append(Paragraph(f'Gerado em {datetime.now().strftime("%d/%m/%Y as %H:%M")}', footer_style))
story.append(Spacer(1, 8))
story.append(Paragraph('Desenvolvido por Rob Silva', footer_style))
story.append(Paragraph('linkedin.com/in/robsilva1', linkedin_style))

doc.build(story)

# Add Z.ai metadata using pypdf
reader = PdfReader('${pdfPath}')
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

writer.add_metadata({
    '/Title': 'Questionario - Gestao da Clinica de Reabilitacao',
    '/Author': 'Rob Dev',
    '/Creator': 'Rob Silva',
    '/Subject': 'Formulario Digital - Respostas do Questionario'
})

with open('${pdfPath}', 'wb') as output:
    writer.write(output)

print('PDF generated successfully with Rob Dev branding')
`

  // Write Python script
  const scriptPath = path.join(tempDir, `generate_${timestamp}.py`)
  fs.writeFileSync(scriptPath, pythonScript)
  
  try {
    // Execute Python script using venv python
    execSync(`/home/z/.venv/bin/python3 ${scriptPath}`, { timeout: 30000 })
    
    // Read generated PDF
    const pdfBuffer = fs.readFileSync(pdfPath)
    
    // Cleanup temp files
    fs.unlinkSync(jsonPath)
    fs.unlinkSync(scriptPath)
    fs.unlinkSync(pdfPath)
    
    return pdfBuffer
  } catch (error) {
    // Cleanup on error
    try {
      fs.unlinkSync(jsonPath)
      fs.unlinkSync(scriptPath)
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath)
    } catch {}
    throw error
  }
}
