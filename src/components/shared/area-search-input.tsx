"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface BiteshipAreaResult {
  id: string;
  name: string;
  administrative_division_level_1_name: string;
  administrative_division_level_2_name: string;
  administrative_division_level_3_name: string | null;
  postal_code: number;
}

interface AreaSearchInputProps {
  placeholder?: string;
  onSelect: (area: BiteshipAreaResult) => void;
}

export function AreaSearchInput({ placeholder = "Cari kecamatan / kota / kode pos...", onSelect }: AreaSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BiteshipAreaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/biteship/areas?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(res.ok ? data.areas ?? [] : []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="pl-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {results.map((area) => (
            <button
              key={area.id}
              type="button"
              onClick={() => {
                onSelect(area);
                setQuery(area.name);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-start gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">{area.name}</p>
                <p className="text-xs text-muted-foreground">
                  {area.administrative_division_level_2_name}, {area.administrative_division_level_1_name} · {area.postal_code}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
