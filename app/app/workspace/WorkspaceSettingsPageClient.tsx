"use client"

import { WorkspaceDetailsForm } from "@/components/app/workspace/workspace-details-form"
import { DangerZone } from "@/components/app/workspace/danger-zone"
import { Separator } from "@/components/ui/separator"

export default function WorkspaceSettingsPageClient() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary dark:text-primary-foreground/90">
          Workspace Settings
        </h1>
        <p className="text-muted-foreground">Manage your overall workspace configuration and critical actions.</p>
      </div>
      <Separator />

      <WorkspaceDetailsForm />

      <Separator />

      <DangerZone />
    </div>
  )
}
