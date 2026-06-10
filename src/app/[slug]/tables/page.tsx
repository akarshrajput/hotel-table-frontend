"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Download,
  QrCode,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Table {
  _id: string;
  tableNumber: number;
  qrCodeUrl: string;
  isActive: boolean;
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTablesCount, setTotalTablesCount] = useState(0);

  const fetchTables = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/owner/tables?page=${page}&limit=20`);
      setTables(data.tables || []);
      setTotalPages(data.pages || 1);
      setTotalTablesCount(data.total || 0);
    } catch {
      toast.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleAddTable = async () => {
    const num = parseInt(newTableNumber);
    if (!num || num < 1) {
      toast.error("Enter a valid table number");
      return;
    }
    setAdding(true);
    try {
      await api.post("/api/owner/tables", { tableNumber: num });
      toast.success(`Table #${num} added`);
      setNewTableNumber("");
      setAddModalOpen(false);
      fetchTables();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to add table");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteTable = async (id: string, num: number) => {
    if (!confirm(`Delete Table #${num}?`)) return;
    try {
      await api.delete(`/api/owner/tables/${id}`);
      toast.success("Table deleted");
      if (tables.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchTables();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleDownloadQR = (table: Table) => {
    const link = document.createElement("a");
    link.download = `table-${table.tableNumber}-qr.png`;
    link.href = table.qrCodeUrl;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogTrigger render={<Button className="bg-[#10b981] hover:bg-[#059669] text-white" />}>
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Table</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Table Number</Label>
                <Input
                  type="number"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="e.g. 1"
                  min="1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddTable()}
                />
              </div>
              <Button
                onClick={handleAddTable}
                disabled={adding}
                className="w-full"
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create Table"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tables.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pb-3 pr-4">Table Number</TableHead>
                    <TableHead className="pb-3 pr-4">QR Code</TableHead>
                    <TableHead className="pb-3 pr-4">Status</TableHead>
                    <TableHead className="pb-3 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table._id}>
                      <TableCell className="py-3 pr-4 font-semibold text-sm">
                        Table #{table.tableNumber}
                      </TableCell>
                      <TableCell className="py-3 pr-4">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg p-1 flex items-center justify-center">
                          {table.qrCodeUrl ? (
                            <img
                              src={table.qrCodeUrl}
                              alt={`Table ${table.tableNumber} QR`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <QrCode className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 pr-4">
                        <Badge
                          variant={table.isActive ? "default" : "secondary"}
                          className={
                            table.isActive
                              ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                              : ""
                          }
                        >
                          {table.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadQR(table)}
                          >
                            <Download className="w-3.5 h-3.5 mr-1" />
                            Download QR
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 hover:border-red-200"
                            onClick={() =>
                              handleDeleteTable(table._id, table.tableNumber)
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
              <div className="text-xs text-gray-400">
                Showing {Math.min(totalTablesCount, (page - 1) * 20 + 1)}–{Math.min(totalTablesCount, page * 20)} of {totalTablesCount} tables
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 text-xs hover:bg-gray-50 border-gray-200"
                >
                  Previous
                </Button>
                <div className="flex items-center text-xs font-medium px-2 text-gray-500">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 text-xs hover:bg-gray-50 border-gray-200"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {tables.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <QrCode className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-sm mb-2">No tables yet</p>
          <p className="text-xs text-gray-300">
            Add a table to generate a QR code for it
          </p>
        </div>
      )}
    </div>
  );
}
