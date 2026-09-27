import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/phone";
import { Button } from "@/components/ui/button";

export function WhatsAppButton({
  phone,
  message,
  label = "Open WhatsApp",
  size = "default",
}: {
  phone: string | null | undefined;
  message?: string;
  label?: string;
  size?: "default" | "sm" | "icon" | "icon-sm";
}) {
  const href = whatsappUrl(phone, message);
  if (!href) {
    return (
      <Button type="button" variant="outline" size={size} disabled>
        <MessageCircle />
        {size === "icon" || size === "icon-sm" ? null : "No phone"}
      </Button>
    );
  }
  return (
    <Button asChild variant="outline" size={size}>
      <a href={href} target="_blank" rel="noreferrer">
        <MessageCircle />
        {size === "icon" || size === "icon-sm" ? null : label}
      </a>
    </Button>
  );
}
