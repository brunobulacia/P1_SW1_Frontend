"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { getDiagramByInvitationToken } from "@/api/invitations";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface InvitationForm {
  token: string;
}

export default function InvitationPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<InvitationForm>();
  const { setCollaboratorAccess } = useAuthStore();

  const handleAction = async (data: InvitationForm) => {
    console.log("Unirse al diagrama", data);

    try {
      const diagram = await getDiagramByInvitationToken(data.token);
      console.log("Diagrama obtenido:", diagram);
      
      if (diagram && diagram.id) {
        // Establecer acceso de colaborador en el store
        setCollaboratorAccess(data.token, diagram.id);
        
        // Redirigir al diagrama
        router.push(`/diagram/?id=${diagram.id}`);
      }
    } catch (error) {
      console.error("Error al unirse al diagrama:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Token de invitación al diagrama</CardTitle>
          <CardDescription>
            Ingrese el token que ha recibido para unirse al diagrama
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="token">Token</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Ingrese su token aquí"
                  required
                  {...register("token")}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            onClick={handleSubmit(handleAction)}
          >
            Unirse al diagrama
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
