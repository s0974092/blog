'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, PencilIcon, Trash2Icon, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation'
import type { Post } from '@/types/post-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EllipsisTooltip } from '@/components/ui/EllipsisTooltip';

export default function Posts() {
  const router = useRouter()
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          search,
          page: page.toString(),
          pageSize: "10",
          all: "true",
        });
        const response = await fetch(`/api/posts?${params}`);
        if (!response.ok) throw new Error("獲取文章列表失敗");
        const data = await response.json();
        console.log("文章列表:", data.data.items);
        
        setPosts(data.data.items);
        setTotalPages(data.data.totalPages);
      } catch (error) {
        console.error("獲取文章列表失敗:", error);
        toast.error("獲取文章列表失敗");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [search, page]);

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
    <div className="container mx-auto">
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
          <Button className="cursor-pointer" onClick={() => router.push('/posts/new')}>
            <PlusIcon className="w-4 h-4 mr-2" />
            新增文章
          </Button>
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
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="whitespace-nowrap align-middle text-center w-[80px]">
                      <Badge variant={post.published ? "success" : "secondary"}>
                        {post.published ? "已發布" : "草稿"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <EllipsisTooltip className="max-w-[120px] inline-block align-bottom">{post.slug}</EllipsisTooltip>
                    </TableCell>
                    <TableCell>
                      <EllipsisTooltip className="max-w-[180px] inline-block align-bottom">{post.title}</EllipsisTooltip>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <EllipsisTooltip className="max-w-[100px] inline-block align-bottom">{post.category?.name || "無"}</EllipsisTooltip>
                        {post.subcategory && (
                          <EllipsisTooltip className="max-w-[100px] inline-block align-bottom text-sm text-gray-500">{post.subcategory.name}</EllipsisTooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {post.tags && post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="truncate max-w-[80px]">{tag.name}</Badge>
                        ))}
                        {post.tags && post.tags.length > 3 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" className="cursor-pointer">...</Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {post.tags.slice(3).map(tag => tag.name).join(', ')}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{post.createdAt ? format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm:ss') : ''}</TableCell>
                    <TableCell>{post.updatedAt ? format(new Date(post.updatedAt), 'yyyy-MM-dd HH:mm:ss') : ''}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() => router.push(`/posts/${post.id}`)}
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
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}