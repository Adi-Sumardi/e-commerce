"use client";

import { WhatsappIcon } from "./social-icons";

interface FloatingWhatsappProps {
  phone?: string;
}

export function FloatingWhatsapp({ phone = "6281234567890" }: FloatingWhatsappProps) {
  const cleanPhone = (process.env.NEXT_PUBLIC_STORE_WHATSAPP || phone).replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
  const message = encodeURIComponent("Halo Pratama Jaya, saya ingin tanya stok & order produk.");
  const waUrl = `https://wa.me/${formattedPhone}?text=${message}`;

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#20bd5a] hover:shadow-2xl active:scale-95"
        aria-label="Tanya Stok & Order via WhatsApp"
      >
        <WhatsappIcon className="size-6 shrink-0 fill-current animate-bounce duration-1000" />
        <span className="text-xs font-extrabold tracking-wide md:text-sm whitespace-nowrap drop-shadow-xs">
          Tanya Stok & Order
        </span>
      </a>
    </div>
  );
}
