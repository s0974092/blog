'use client';

import { Mail, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from 'sonner';
import { checkSession, signIn } from '@/lib/auth';

// 定義表單驗證 schema
const loginSchema = z.object({
  email: z.string()
    .email({ message: "請輸入有效的電子郵件地址" })
    .min(1, { message: "電子郵件是必填項" }),
  password: z.string()
    .min(6, { message: "密碼至少需要6個字符" })
    .max(50, { message: "密碼不能超過50個字符" })
});

type LoginFormValues = z.infer<typeof loginSchema>;

const gradients = [
  { bg: "linear-gradient(45deg, #818CF8, #93C5FD)", color: "#818CF8" },
  { bg: "linear-gradient(45deg, #93C5FD, #6EE7B7)", color: "#93C5FD" },
  { bg: "linear-gradient(45deg, #6EE7B7, #818CF8)", color: "#6EE7B7" }
];

export default function LoginPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      try {
        const session = await checkSession();
        if (session) {
          // 如果已登入，跳轉到儀表板
          window.location.href = '/dashboard';
          return;
        }
      } catch (error) {
        console.error('檢查登入狀態失敗:', error);
        toast.error('檢查登入狀態失敗');
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const email = watch("email");
  const password = watch("password");
  const isFormEmpty = !email && !password;

  const onSubmit = async (data: LoginFormValues) => {
    const result = await signIn(data);
    
    if (result.success) {
      toast.success('登入成功！');
      
      // 直接使用 window.location.href 進行硬重定向，避免路由系統可能的問題
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } else {
      toast.error('登入失敗: ' + result.error);
    }
  };

  // 顯示載入狀態
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-between relative overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: gradients.map(g => g.bg),
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      <motion.div 
        className="w-1/2 p-8 flex items-center justify-center relative z-10"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md">
          <Card className="w-full bg-white/30 backdrop-blur-xl shadow-lg border border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">歡迎回來</CardTitle>
              <CardDescription className="text-center text-gray-700">
                請輸入您的帳號密碼進行登入
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-800">
                    電子郵件
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Mail className="h-5 w-5 text-gray-500 z-10" />
                    </div>
                    <Input
                      id="email"
                      {...register("email")}
                      className="pl-10 bg-white/50 backdrop-blur-sm border-white/20 text-gray-900 placeholder-gray-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-800">
                    密碼
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Lock className="h-5 w-5 text-gray-500 z-10" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      className="pl-10 bg-white/50 backdrop-blur-sm border-white/20 text-gray-900 placeholder-gray-500"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={isSubmitting || isFormEmpty || !isValid}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      登入中...
                    </>
                  ) : (
                    "登入"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </motion.div>
      
      <motion.div 
        className="w-1/2 p-8 flex items-center justify-center relative z-10"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{
            color: gradients.map(g => g.color),
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="w-full h-auto max-w-lg"
        >
          <Image
            src="/blog.svg"
            alt="Blog illustration"
            width={400}
            height={300}
            className="w-full h-auto"
            priority
          />
        </motion.div>
      </motion.div>
    </div>
  );
} 