"use client"

import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { mockInvoices } from "@/lib/mock-data"
import type { Invoice } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

interface InvoiceHistoryTableProps {
  isLoading?: boolean
}

export function InvoiceHistoryTable({ isLoading = false }: InvoiceHistoryTableProps) {
  const invoices: Invoice[] = mockInvoices

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "success"
      case "pending":
        return "warning"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const renderSkeletonRows = (count: number) =>
    Array(count)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-invoice-${index}`}>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-md" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-8 w-8 rounded-md ml-auto" />
          </TableCell>
        </TableRow>
      ))

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableCaption className="py-4">Your invoice history.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Date</TableHead>
              <TableHead className="min-w-[120px]">Amount</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="text-right min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              renderSkeletonRows(3)
            ) : invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.date}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(invoice.status) as any}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Image
                      src="/placeholder.svg?width=128&height=128"
                      width={128}
                      height={128}
                      alt="No invoices illustration"
                      className="opacity-50"
                    />
                    <h3 className="text-lg font-semibold text-foreground">No Invoices Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Your billing history will appear here once you have invoices.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
