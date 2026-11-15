"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export function ModalDemo() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
      <Button variant="outline" onClick={() => setSheetOpen(true)}>
        Open sheet
      </Button>

      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Dialog example"
        description="Focus is trapped inside. Press Escape or click the backdrop to close."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDialogOpen(false)}>Done</Button>
          </>
        }
      >
        <TextField id="demo-dialog-field" label="Example field" placeholder="Type something" />
      </Modal>

      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Sheet example"
        description="On small screens this slides up from the bottom, like the mobile “More” menu."
        variant="sheet"
        size="sm"
      >
        <Button variant="secondary" className="w-full" onClick={() => setSheetOpen(false)}>
          Close sheet
        </Button>
      </Modal>
    </div>
  );
}
