'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, PlusIcon, PencilIcon, Trash2Icon, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";

export default function Posts() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // 處理搜索
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // 處理分頁
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              type="text"
              placeholder="搜尋文章標題..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Link href="/posts/new">
            <Button className="cursor-pointer">
              <PlusIcon className="w-4 h-4 mr-2" />
              新增文章
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>發佈狀態</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>標題</TableHead>
                  <TableHead>主題</TableHead>
                  <TableHead>標籤</TableHead>
                  <TableHead>建立時間</TableHead>
                  <TableHead>更新時間</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Badge variant="success">已發布</Badge>
                  </TableCell>
                  <TableCell>example-post</TableCell>
                  <TableCell>範例文章</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>主主題</span>
                      <span className="text-sm text-gray-500">子主題</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant="secondary">標籤1</Badge>
                      <Badge variant="secondary">標籤2</Badge>
                    </div>
                  </TableCell>
                  <TableCell>2024-04-01 12:00</TableCell>
                  <TableCell>2024-04-01 12:00</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                      >
                        <PencilIcon className="w-4 h-4" />
                        <span className="sr-only">編輯</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                      >
                        <Trash2Icon className="w-4 h-4" />
                        <span className="sr-only">刪除</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={10}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  )
} 