'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PencilIcon, Trash2Icon, PlusIcon, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pagination } from "@/components/ui/pagination"

interface Tag {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

interface PostSummary {
  id: number
  title: string
  createdAt: string
}

interface TagsResponse {
  success: boolean
  data: Tag[]
  pagination: {
    page: number
    totalPages: number
  }
}

interface CountsResponse {
  success: boolean
  counts: Record<number, number>
}

interface PostsResponse {
  success: boolean
  data: {
    posts: PostSummary[]
  }
}

export default function TagsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openPostsDialog, setOpenPostsDialog] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // 獲取標籤列表
  const { data: tagsResponse, isLoading: isLoadingTags } = useQuery<TagsResponse>({
    queryKey: ['tags', search, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        pageSize: pageSize.toString(),
      })
      const res = await fetch(`/api/tags?${params}`)
      if (!res.ok) {
        throw new Error('獲取標籤列表失敗')
      }
      return res.json()
    },
  })

  // 獲取標籤文章數量
  const { data: countsResponse } = useQuery<CountsResponse>({
    queryKey: ['tagCounts'],
    queryFn: async () => {
      const res = await fetch('/api/tags/counts')
      if (!res.ok) {
        throw new Error('獲取文章數量失敗')
      }
      return res.json()
    },
  })

  // 獲取特定標籤的相關文章
  const { data: postsResponse, isLoading: loadingPosts } = useQuery<PostsResponse>({
    queryKey: ['tagPosts', selectedTag?.id],
    queryFn: async () => {
      if (!selectedTag) return null
      const res = await fetch(`/api/tags/${selectedTag.id}?posts=true`)
      if (!res.ok) {
        throw new Error('獲取相關文章失敗')
      }
      return res.json()
    },
    enabled: !!selectedTag,
  })

  const tags = tagsResponse?.data || []
  const postCounts = countsResponse?.counts || {}
  const relatedPosts = postsResponse?.data?.posts || []
  const pagination = tagsResponse?.pagination || {
    page: 1,
    totalPages: 1,
  }

  // 處理搜索
  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  // 處理分頁
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // 處理新增標籤按鈕點擊
  const handleCreateClick = () => {
    router.push('/tags/new', { scroll: false })
  }

  // 處理編輯按鈕點擊
  const handleEditClick = (tag: Tag) => {
    router.push(`/tags/edit/${tag.id}`, { scroll: false })
  }

  // 處理刪除按鈕點擊
  const handleDeleteClick = (tag: Tag) => {
    setSelectedTag(tag)
    setOpenDeleteDialog(true)
  }

  // 處理查看文章按鈕點擊
  const handlePostsClick = (tag: Tag) => {
    setSelectedTag(tag)
    setOpenPostsDialog(true)
  }

  // 處理刪除標籤
  const deleteTag = async () => {
    if (!selectedTag) return

    try {
      const response = await fetch(`/api/tags/${selectedTag.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('刪除標籤失敗')
      }

      toast.success('標籤刪除成功')
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tagCounts'] })
      setOpenDeleteDialog(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '刪除標籤失敗')
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">標籤管理</h1>
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              placeholder="搜尋標籤..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateClick} className="cursor-pointer">
            <PlusIcon className="w-4 h-4 mr-2" />
            新增標籤
          </Button>
        </div>
      </div>

      {isLoadingTags ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>名稱</TableHead>
                  <TableHead>文章數量</TableHead>
                  <TableHead>建立時間</TableHead>
                  <TableHead>更新時間</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>{tag.id}</TableCell>
                    <TableCell>{tag.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        className="px-2 h-auto font-normal hover:underline cursor-pointer"
                        onClick={() => handlePostsClick(tag)}
                      >
                        {postCounts[tag.id] || 0}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {format(new Date(tag.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(tag.updatedAt), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(tag)}
                          className="cursor-pointer"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span className="sr-only">編輯</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(tag)}
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
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除標籤「{selectedTag?.name}」嗎？
              {postCounts[selectedTag?.id || 0] > 0 && (
                <p className="text-red-500 mt-2">
                  注意：此標籤下有 {postCounts[selectedTag?.id || 0]} 篇文章，刪除標籤將會移除這些文章的標籤關聯。
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">取消</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTag} className="cursor-pointer bg-red-600 hover:bg-red-500">確認刪除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={openPostsDialog} onOpenChange={setOpenPostsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>標籤「{selectedTag?.name}」的相關文章</DialogTitle>
          </DialogHeader>
          {loadingPosts ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : relatedPosts.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {relatedPosts.map((post: PostSummary) => (
                  <div key={post.id} className="p-4 border rounded">
                    <h3 className="font-medium">{post.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      發布時間：{format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-center text-gray-500 py-8">暫無相關文章</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 