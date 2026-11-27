import { listProjectsOptions } from "@/api/@tanstack/react-query.gen";
import type { Project } from "@/api/types.gen";
import {
  AddProjectDialog,
  DeleteProjectDialog,
  EditProjectDialog,
  PROGRESS_STAGES,
  ProjectDetailDialog,
} from "@/components/projects";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { formatRupiah } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EllipsisVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/projects/")({
  component: ProjectsPage,
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: (search.q as string) || undefined,
  }),
});

function ProjectsPage() {
  const navigate = useNavigate();
  const { q } = Route.useSearch();
  const { isAdmin, user, openLoginModal } = useAuth();

  const [page] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const { data, isLoading } = useQuery({
    ...listProjectsOptions({
      query: { q: q || undefined, page, per_page: 25 },
    }),
  });

  const handleOpenAdd = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    if (!user) {
      openLoginModal();
      return;
    }
    setEditingProject(p);
  };

  const projects = data?.data ?? [];
  const colSpanCount = isAdmin ? 8 : 7;

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Proyek
        </h1>
        <div className="flex items-center justify-between gap-4">
          <InputGroup>
            <InputGroupAddon>
              <Search data-icon="inline-start" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Cari..."
              value={q || ""}
              onChange={(e) =>
                navigate({
                  search: ((prev: any) => ({
                    ...prev,
                    q: e.target.value || undefined,
                  })) as any,
                  replace: true,
                })
              }
            />
          </InputGroup>
          <Button onClick={handleOpenAdd}>
            <Plus data-icon="inline-start" />
            Proyek
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Proyek</TableHead>
              <TableHead>Bagian</TableHead>
              <TableHead>Plant</TableHead>
              <TableHead>Tanggal Rencana</TableHead>
              <TableHead>Anggaran</TableHead>
              <TableHead>Progres</TableHead>
              {isAdmin && (
                <TableHead>Aksi</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={colSpanCount}
                >
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colSpanCount}
                >
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>Belum ada proyek</EmptyTitle>
                      <EmptyDescription>
                        {q
                          ? `Tidak ada proyek yang cocok dengan "${q}".`
                          : "Mulai dengan menambahkan proyek baru."}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p, idx) => {
                const doneStages = PROGRESS_STAGES.filter(
                  (s) => (p as any)[s.key] === "done"
                );

                return (
                  <TableRow
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                  >
                    <TableCell>
                      {(page - 1) * 25 + idx + 1}
                    </TableCell>
                    <TableCell>
                      {p.name}
                    </TableCell>
                    <TableCell>{p.section || "-"}</TableCell>
                    <TableCell>{p.plant || "-"}</TableCell>
                    <TableCell>
                      {p.implementation_plan || "-"}
                    </TableCell>
                    <TableCell>
                      {formatRupiah(p.budget)}
                    </TableCell>
                    <TableCell>
                      {doneStages.length}/{PROGRESS_STAGES.length}
                    </TableCell>
                    {isAdmin && (
                      <TableCell
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                              />
                            }
                          >
                            <EllipsisVertical />
                            <span className="sr-only">Aksi</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem onClick={() => handleOpenEdit(p)}>
                                <Pencil />
                                <span>Ubah</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeletingProject(p)}
                              >
                                <Trash2 />
                                <span>Hapus</span>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AddProjectDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
      />

      <DeleteProjectDialog
        project={deletingProject}
        open={Boolean(deletingProject)}
        onOpenChange={(open) => {
          if (!open) setDeletingProject(null);
        }}
      />

      <EditProjectDialog
        project={editingProject}
        open={Boolean(editingProject)}
        onOpenChange={(open) => {
          if (!open) setEditingProject(null);
        }}
      />

      {selectedProject && (
        <ProjectDetailDialog
          project={selectedProject}
          open={Boolean(selectedProject)}
          onClose={() => setSelectedProject(null)}
          onNavigate={(path) => {
            setSelectedProject(null);
            navigate({ to: path });
          }}
        />
      )}
    </div>
  );
}
