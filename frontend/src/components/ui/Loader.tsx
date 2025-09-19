import { RefreshCw } from "lucide-react";

interface LoaderProps {
  text?: string;
}

export function Loader({ text = "Loading..." }: LoaderProps) {
  return (
    <div className="text-center py-12">
      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      <p className="mt-2 text-muted-foreground">{text}</p>
    </div>
  );
}
