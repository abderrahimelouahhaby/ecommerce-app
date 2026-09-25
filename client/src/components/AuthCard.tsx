import type { ReactNode } from "react";
import { Store } from "lucide-react";
import { Card, CardContent } from "./ui/card";

type AuthCardProps = {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
};

function AuthCard({ title, subtitle, footer, children }: AuthCardProps) {
  return (
    <section className="mx-auto w-full max-w-md">
      <Card>
        <CardContent className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Store className="size-5" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
    </section>
  );
}

export default AuthCard;
