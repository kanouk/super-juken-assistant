
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup } from "@/components/ui/input-otp";
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
  // input refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 初回表示時に先頭inputへ自動フォーカス
  useEffect(() => {
    const timer = setTimeout(() => {
      if (otpGroupRef.current) {
        const inputField = otpGroupRef.current.querySelector('input');
        inputField?.focus();
      }
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 30);
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
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 500);
      }
    }
  }, [expectedPasscode, onAuthenticated]);

  // 1文字入力ごとに次inputへ移動
  const handleInput = (e: React.FormEvent<HTMLInputElement>, idx: number) => {
    const input = e.target as HTMLInputElement;
    if (input.value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

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
              key={passcodeInput.length === 0 ? Math.random() : "otp"}
              render={({ slots }) => (
                <InputOTPGroup ref={otpGroupRef} className="gap-2">
                  {slots.map((slot, index) => (
                    <div
                      key={index}
                      className="relative flex h-12 w-12 items-center justify-center border-y border-r border-white/30 text-xl rounded-lg bg-white/10 backdrop-blur-xl first:rounded-l-lg last:rounded-r-lg"
                    >
                      <input
                        {...slot.inputProps}
                        ref={el => inputRefs.current[index] = el}
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        autoFocus={index === 0}
                        tabIndex={0}
                        className="w-full h-full text-center bg-transparent focus:outline-none text-white text-2xl font-bold selection:bg-blue-100"
                        onInput={e => handleInput(e, index)}
                        aria-label={`パスコード桁${index + 1}`}
                        autoComplete="one-time-code"
                      />
                      {/* カーソルなどslotの視覚情報は保持 */}
                      {slot.hasFakeCaret && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="h-4 w-px animate-caret-blink bg-white duration-1000" />
                        </div>
                      )}
                    </div>
                  ))}
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
