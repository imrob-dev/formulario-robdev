import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DynamicForm } from "./DynamicForm";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  // Await params first to satisfy Next.js page requirements
  const { slug } = await params;
  const form = await db.form.findUnique({ where: { slug } });
  if (!form) return { title: "Formulário não encontrado" };
  return { title: form.title, description: form.description };
}

export default async function CustomFormPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const formRecord = await db.form.findUnique({ where: { slug } });
  
  if (!formRecord) {
    notFound();
  }

  const schemaStr = formRecord.schema;
  let schema: any = {};
  try {
    schema = JSON.parse(schemaStr);
  } catch (e) {
    console.error("Invalid schema json:", e);
  }

  const sections: any[] = [];
  let currentSection: any = null;
  const emojis = ['🚀', '⚙️', '👥', '📊', '🔥', '💡', '💬', '📈'];
  let sIdx = 0;

  for (const item of schema.items || []) {
    if (item.pageBreakItem) {
      currentSection = {
        id: `sec_${sections.length}`,
        title: item.title || 'Seção',
        description: item.description || '',
        emoji: emojis[sIdx % emojis.length],
        questions: []
      };
      sections.push(currentSection);
      sIdx++;
    } else if (item.questionItem) {
      if (!currentSection) {
        currentSection = { id: 'default', title: 'Geral', description: '', emoji: '📋', questions: [] };
        sections.push(currentSection);
      }
      
      const q = item.questionItem.question;
      let type: 'text' | 'textarea' | 'radio' | 'checkbox' = 'text';
      let options = undefined;

      if (q?.textQuestion) {
        type = q.textQuestion.paragraph ? 'textarea' : 'text';
      } else if (q?.choiceQuestion) {
        type = q.choiceQuestion.type === 'CHECKBOX' ? 'checkbox' : 'radio';
        options = q.choiceQuestion.options;
      }

      currentSection.questions.push({
        id: q?.questionId || `q_${Math.random()}`,
        type,
        question: item.title || '',
        helperText: item.description || '',
        required: q?.required || false,
        options
      });
    }
  }

  return <DynamicForm title={formRecord.title} sections={sections} />;
}
