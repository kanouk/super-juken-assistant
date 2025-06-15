
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Lock } from "lucide-react";

interface PasscodeAuthProps {
  expectedPasscode: string;
  onAuthenticated: () => void;
  onBack: () => void;
}

export const PasscodeAuth = ({ expectedPasscode, onAuthenticated, onBack }: PasscodeAuthProps) => {
  const [passcodeInput, setPasscodeInput] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const otpGroupRef = useRef<HTMLDivElement>(null);

  // 初回表示時に先頭inputへ自動フォーカス
  useEffect(() => {
    const timer = setTimeout(() => {
      const input = otpGroupRef.current?.querySelector('input');
      input?.focus();
    }, 20);
    return () => clearTimeout(timer);
  }, []);

  // 入力＆バリデーション
  const handlePasscodeChange = useCallback((value: string) => {
    setPasscodeInput(value);

    if (value.length === 6) {
      if (value === expectedPasscode) {
        onAuthenticated();
      } else {
        setIsShaking(true);
        setPasscodeInput('');
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
        setTimeout(() => {
          setIsShaking(false);
          const input = otpGroupRef.current?.querySelector('input');
          input?.focus();
        }, 500);
      }
    }
  }, [expectedPasscode, onAuthenticated]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-3xl"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      <div className="relative w-full max-w-sm mx-auto">
        <div className={`bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 transition-transform duration-200 ${isShaking ? 'animate-bounce' : ''}`}>
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-lg border border-white/30">
              <Lock className="h-10 w-10 text-white/90" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">設定へのアクセス</h1>
            <p className="text-white/70">6桁のパスコードを入力してください</p>
          </div>
          <div className="flex justify-center mb-8">
            <InputOTP
              maxLength={6}
              value={passcodeInput}
              onChange={handlePasscodeChange}
              containerClassName=""
              render={({ slots }) => (
                <InputOTPGroup ref={otpGroupRef} className="gap-2">
                  {/* slotsへの安全なアクセス */}
                  {Array.isArray(slots) && slots.length === 6
                    ? slots.map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="relative flex h-12 w-12 items-center justify-center border-y border-r border-white/30 text-xl rounded-lg bg-white/10 backdrop-blur-xl first:rounded-l-lg last:rounded-r-lg text-white text-2xl font-bold"
                        />
                      ))
                    // slots配列が異常なら空スロットで埋める（ライブラリ異常系対応）
                    : Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={index}
                          className="relative flex h-12 w-12 items-center justify-center border-y border-r border-white/30 text-xl rounded-lg bg-white/10 backdrop-blur-xl first:rounded-l-lg last:rounded-r-lg text-white text-2xl font-bold opacity-50"
                        >*</div>
                      ))
                  }
                </InputOTPGroup>
              )}
            />
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:text-white"
              onClick={onBack}
            >
              キャンセル
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
