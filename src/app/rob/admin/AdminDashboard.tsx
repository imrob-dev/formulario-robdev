"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Trash2, Edit } from "lucide-react";

export function AdminDashboard({ initialForms }: { initialForms: any[] }) {
  const [forms, setForms] = useState(initialForms);
  const [open, setOpen] = useState(false);
  
  // Create state
  const [slug, setSlug] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !slug) return;
    
    setUploading(true);
    try {
      const text = await file.text();
      const schema = JSON.parse(text);

      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, schema })
      });

      if (!res.ok) throw new Error(await res.text());
      
      const newForm = await res.json();
      setForms([newForm, ...forms]);
      setOpen(false);
      setSlug("");
      setFile(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Falha ao criar formulário. Verifique se o JSON é válido ou se a URL já existe.");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !editTitle.trim()) return;

    setEditing(true);
    try {
      let schema: any = undefined;
      
      if (editFile) {
        const text = await editFile.text();
        schema = JSON.parse(text);
      }

      const res = await fetch(`/api/forms/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          schema
        })
      });

      if (!res.ok) throw new Error(await res.text());
      
      const updatedForm = await res.json();
      setForms(forms.map(f => f.id === updatedForm.id ? updatedForm : f));
      setEditOpen(false);
      setEditForm(null);
      setEditTitle("");
      setEditFile(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Falha ao editar formulário. Verifique se o JSON é válido.");
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este formulário?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao deletar");

      setForms(forms.filter(f => f.id !== id));
      router.refresh();
    } catch (error) {
       alert("Falha ao excluir formulário.");
    } finally {
       setDeletingId(null);
    }
  };

  const openEditModal = (form: any) => {
    setEditForm(form);
    setEditTitle(form.title);
    setEditFile(null);
    setEditOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Meus Formulários</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Novo Formulário (JSON)</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Carregar Formulário Google (JSON)</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="slug">Endpoint (Slug)</Label>
                <Input 
                  id="slug" 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value)} 
                  placeholder="ex: onboarding-crm" 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">Arquivo JSON</Label>
                <Input 
                  id="file" 
                  type="file" 
                  accept=".json" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                  required 
                />
              </div>
              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? "Salvando..." : "Criar Formulário"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map(f => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.title}</TableCell>
                <TableCell>/f/{f.slug}</TableCell>
                <TableCell>{new Date(f.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a href={`/f/${f.slug}`} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">Vizualizar</Button>
                    </a>
                    <Button variant="outline" size="sm" onClick={() => openEditModal(f)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(f.id)}
                      disabled={deletingId === f.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {forms.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  Nenhum formulário cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Form Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Formulário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="editTitle">Título do Formulário</Label>
              <Input 
                id="editTitle" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editFile">
                Arquivo JSON (Deixe vazio para manter o atual)
              </Label>
              <Input 
                id="editFile" 
                type="file" 
                accept=".json" 
                onChange={(e) => setEditFile(e.target.files?.[0] || null)} 
              />
            </div>
            <Button type="submit" disabled={editing} className="w-full">
              {editing ? "Salvando alterações..." : "Salvar Alterações"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
