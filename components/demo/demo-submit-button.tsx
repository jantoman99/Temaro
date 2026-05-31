"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DemoSubmitButton({
  children,
  message = "Demo režim: tato akce se zatím reálně neuloží.",
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const [notice, setNotice] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setNotice(message)}
      >
        {children}
      </Button>
      {notice ? <p className="text-xs text-amber-700">{notice}</p> : null}
    </div>
  );
}
