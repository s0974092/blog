'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signOut } from '@/lib/auth';

interface UserProfileProps {
  user: {
    email: string;
    user_metadata: {
      display_name: string;
    };
  };
}

export default function UserProfile({ user }: UserProfileProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const result = await signOut();
    
    if (result.success) {
      toast.success('已成功登出');
      router.replace('/blog');
    } else {
      toast.error('登出失敗: ' + result.error);
    }
  };

  return (
    <div className="flex justify-end">
      <div className="flex items-center gap-4">
        <span className="text-gray-600">
          Hi <span className="text-gray-600 font-bold">
            {user?.user_metadata?.display_name}
          </span>
        </span>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="text-red-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
        >
          登出
        </Button>
      </div>
    </div>
  );
} 