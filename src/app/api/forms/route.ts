import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { schema, slug } = await req.json();
    
    if (!slug) {
       return new NextResponse("Slug é obrigatório", { status: 400 });
    }

    const title = schema?.info?.title || "Formulário sem título";
    const description = schema?.info?.documentTitle || "";

    const form = await db.form.create({
      data: {
        slug,
        title,
        description,
        schema: JSON.stringify(schema)
      }
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error("[FORMS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
