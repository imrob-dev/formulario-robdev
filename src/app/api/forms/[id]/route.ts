import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, schema } = body;

    const dataToUpdate: any = {};
    if (title) dataToUpdate.title = title;
    if (schema) {
      dataToUpdate.schema = JSON.stringify(schema);
      const docTitle = schema?.info?.documentTitle || "";
      if (docTitle) dataToUpdate.description = docTitle;
    }

    const form = await db.form.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error("[FORM_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const form = await db.form.delete({
      where: { id }
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error("[FORM_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
