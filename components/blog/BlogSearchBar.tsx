import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Category {
  id: number;
  name: string;
}
interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
}

export interface BlogSearchBarProps {
  search: string;
  categoryId: number | '';
  subCategoryId: number | '';
  sort: string;
  onChange: (params: { search: string; categoryId: number | ''; subCategoryId: number | ''; sort: string }) => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: '最新' },
  { value: 'oldest', label: '最舊' },
  { value: 'title-asc', label: '標題A-Z' },
  { value: 'title-desc', label: '標題Z-A' },
];

export default function BlogSearchBar({ search, categoryId, subCategoryId, sort, onChange }: BlogSearchBarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  useEffect(() => {
    fetch('/api/categories?all=true')
      .then(res => res.json())
      .then(data => setCategories(data.data.items || []));
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetch(`/api/categories/${categoryId}/sub-categories?all=true`)
        .then(res => res.json())
        .then(data => setSubCategories(data.data || []));
    } else {
      setSubCategories([]);
    }
  }, [categoryId]);

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      <Input
        className="w-48 h-10 bg-white"
        placeholder="搜尋關鍵字..."
        value={search}
        onChange={e => onChange({ search: e.target.value, categoryId, subCategoryId, sort })}
      />
      <Select
        value={categoryId ? String(categoryId) : 'all'}
        onValueChange={val => onChange({ search, categoryId: val === 'all' ? '' : Number(val), subCategoryId: '', sort })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="全部主題" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部主題</SelectItem>
          {categories.map(cat => (
            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={subCategoryId ? String(subCategoryId) : 'all'}
        onValueChange={val => onChange({ search, categoryId, subCategoryId: val === 'all' ? '' : Number(val), sort })}
        disabled={!categoryId}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="全部子主題" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部子主題</SelectItem>
          {subCategories.map(sub => (
            <SelectItem key={sub.id} value={String(sub.id)}>{sub.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={sort}
        onValueChange={val => onChange({ search, categoryId, subCategoryId, sort: val })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="排序" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        className='h-10'
        onClick={() => onChange({ search: '', categoryId: '', subCategoryId: '', sort: 'newest' })}
      >
        重置
      </Button>
    </div>
  );
} 