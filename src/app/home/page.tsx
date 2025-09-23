"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Search, Plus, Trash2, X, Edit, UserPlus, LogOut, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/store/auth.store"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"


interface SearchForm {
  query: string
}

interface DiagramForm {
  name: string
  description: string
}

interface DeleteConfirmForm {
  confirm: boolean
}

interface Diagram {
  id: number
  name: string
  description?: string
  thumbnail: string
  selected: boolean
}

export default function DclassMigrator() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const fetchDiagrams = async () => {
    // Comentando temporalmente hasta que se implemente la API
    // const data = await getDiagramsByUser("1")
    // setDiagrams(data)
  }

  useEffect(() => {
    fetchDiagrams()
  }, [])

  const [diagrams, setDiagrams] = useState<Diagram[]>([])

  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; diagramId: number } | null>(null)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingDiagram, setEditingDiagram] = useState<Diagram | null>(null)
  const [deletingDiagram, setDeletingDiagram] = useState<Diagram | null>(null)

  const { register, handleSubmit, watch } = useForm<SearchForm>()
  const searchQuery = watch("query", "")

  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd } = useForm<DiagramForm>()
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
  } = useForm<DiagramForm>()
  const {
    register: registerDelete,
    handleSubmit: handleSubmitDelete,
    reset: resetDelete,
  } = useForm<DeleteConfirmForm>()

  const filteredDiagrams = diagrams.filter((diagram) =>
    diagram.name.toLowerCase().includes(searchQuery?.toLowerCase() || ""),
  )

  const selectedCount = diagrams.filter((d) => d.selected).length

  const onSearch = (data: SearchForm) => {
    console.log("Searching for:", data.query)
  }

  const onAddDiagram = (data: DiagramForm) => {
    const newDiagram: Diagram = {
      id: Math.max(...diagrams.map((d) => d.id)) + 1,
      name: data.name,
      description: data.description,
      thumbnail: "/images/image.png",
      selected: false,
    }
    setDiagrams((prev) => [...prev, newDiagram])
    setIsAddDialogOpen(false)
    resetAdd()
  }

  const onEditDiagram = (data: DiagramForm) => {
    if (editingDiagram) {
      setDiagrams((prev) =>
        prev.map((d) => (d.id === editingDiagram.id ? { ...d, name: data.name, description: data.description } : d)),
      )
      setIsEditDialogOpen(false)
      setEditingDiagram(null)
      resetEdit()
    }
  }

  const onDeleteDiagram = (data: DeleteConfirmForm) => {
    if (deletingDiagram && data.confirm) {
      setDiagrams((prev) => prev.filter((d) => d.id !== deletingDiagram.id))
      setIsDeleteDialogOpen(false)
      setDeletingDiagram(null)
      resetDelete()
    }
  }

  const toggleSelection = (id: number) => {
    setDiagrams((prev) => prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d)))
  }

  const selectAll = () => {
    const allSelected = diagrams.every((d) => d.selected)
    setDiagrams((prev) => prev.map((d) => ({ ...d, selected: !allSelected })))
  }

  const handleContextMenu = (e: React.MouseEvent, diagramId: number) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, diagramId })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const handleAction = (action: string, diagramId?: number) => {
    console.log(`Action: ${action}`, diagramId ? `on diagram ${diagramId}` : "")

    if (action === "add") {
      setIsAddDialogOpen(true)
    } else if (action === "edit" && diagramId) {
      const diagram = diagrams.find((d) => d.id === diagramId)
      if (diagram) {
        setEditingDiagram(diagram)
        setEditValue("name", diagram.name)
        setEditValue("description", diagram.description || "")
        setIsEditDialogOpen(true)
      }
    } else if (action === "delete" && diagramId) {
      const diagram = diagrams.find((d) => d.id === diagramId)
      if (diagram) {
        setDeletingDiagram(diagram)
        setIsDeleteDialogOpen(true)
      }
    } else if (action === "logout") {
      logout()
      router.push("/")
    }

    closeContextMenu()
  }

  const deleteSelected = () => {
    setDiagrams((prev) => prev.filter((d) => !d.selected))
    setIsSelectionMode(false)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6" onClick={closeContextMenu}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">DClass Migrator</h1>
            <p className="text-xl text-muted-foreground">Estos son tus Diagramas</p>
          </div>
          {user && (
            <div className="text-right">
              <p className="text-lg font-medium text-foreground">Bienvenido, {user.username}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          )}
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4 mb-8">
          <form onSubmit={handleSubmit(onSearch)} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input {...register("query")} placeholder="Buscar Diagramas" className="pl-10" />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Button onClick={() => handleAction("add")} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>

            <Button
              variant={isSelectionMode ? "default" : "outline"}
              onClick={() => setIsSelectionMode(!isSelectionMode)}
              size="sm"
            >
              Seleccionar
            </Button>

            {isSelectionMode && selectedCount > 0 && (
              <Button variant="destructive" onClick={deleteSelected} size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar ({selectedCount})
              </Button>
            )}
          </div>
        </div>

        {/* Selection Controls */}
        {isSelectionMode && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={diagrams.length > 0 && diagrams.every((d) => d.selected)}
                onCheckedChange={selectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Seleccionar todos ({selectedCount}/{diagrams.length})
              </label>
            </div>
          </div>
        )}

        {/* Diagrams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {filteredDiagrams.map((diagram) => (
            <Card
              key={diagram.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                diagram.selected ? "ring-2 ring-primary" : ""
              }`}
              onContextMenu={(e) => handleContextMenu(e, diagram.id)}
              onClick={() => (isSelectionMode ? toggleSelection(diagram.id) : handleAction("open", diagram.id))}
            >
              <CardContent className="p-4">
                <div className="relative">
                  {isSelectionMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={diagram.selected}
                        onCheckedChange={() => toggleSelection(diagram.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}

                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={diagram.thumbnail}
                      alt={diagram.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{diagram.name}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction("edit", diagram.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("collaborate", diagram.id)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Agregar Colaborador
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("delete", diagram.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed bg-popover border border-border rounded-md shadow-lg py-2 z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center"
              onClick={() => handleAction("edit", contextMenu.diagramId)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center"
              onClick={() => handleAction("collaborate", contextMenu.diagramId)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Colaborador
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center text-destructive"
              onClick={() => handleAction("delete", contextMenu.diagramId)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </button>
          </div>
        )}

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Diagrama</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitAdd(onAddDiagram)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="add-name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="add-name"
                    {...registerAdd("name", { required: true })}
                    className="col-span-3"
                    placeholder="Nombre del diagrama"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="add-description" className="text-right">
                    Descripción
                  </Label>
                  <Textarea
                    id="add-description"
                    {...registerAdd("description", { required: true })}
                    className="col-span-3"
                    placeholder="Descripción del diagrama"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Diagrama</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Diagrama</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit(onEditDiagram)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="edit-name"
                    {...registerEdit("name", { required: true })}
                    className="col-span-3"
                    placeholder="Nombre del diagrama"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Descripción
                  </Label>
                  <Textarea
                    id="edit-description"
                    {...registerEdit("description", { required: true })}
                    className="col-span-3"
                    placeholder="Descripción del diagrama"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitDelete(onDeleteDiagram)}>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  ¿Estás seguro de que deseas eliminar el diagrama "{deletingDiagram?.name}"? Esta acción no se puede
                  deshacer.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox id="confirm-delete" {...registerDelete("confirm", { required: true })} />
                  <Label htmlFor="confirm-delete" className="text-sm">
                    Sí, estoy seguro de eliminar este diagrama
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="destructive">
                  Eliminar Diagrama
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => handleAction("logout")}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
