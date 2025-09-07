import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader,
  CardFooter,
} from "../ui/card";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Trash, Edit, UserRoundPlus } from "lucide-react";

function DiagramCard({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <Card className="w-50 h-55 rounded-2xl bg-gray-200 p-4 shadow-md">
      <CardContent className="flex flex-col gap-4 p-0 w-full">
        <CardHeader>
          <div className="h-20 w-full bg-gray-300"></div>
        </CardHeader>
        <CardFooter className="flex flex-col items-start gap-2">
          <CardTitle>{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardFooter>
        <div className="flex justify-end bg-gray-200">
          <Menubar className="w-8">
            <MenubarMenu>
              <MenubarTrigger className="flex items-center justify-center w-full">
                ...
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  <Trash /> Delete
                </MenubarItem>
                <MenubarItem>
                  <Edit /> Edit
                </MenubarItem>
                <MenubarItem>
                  <UserRoundPlus /> Agregar Colaborador
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </CardContent>
    </Card>
  );
}

export default DiagramCard;
