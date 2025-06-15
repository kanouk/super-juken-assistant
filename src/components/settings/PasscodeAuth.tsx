
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
  // 最新input要素へのref
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 表示時に先頭inputへ自動フォーカス
  useEffect(() => {
    // setTimeout必要: 初回マウント後にinputが描画されるため
    const timer = setTimeout(() => {
      // div配下のinput全てを取得
      if (otpGroupRef.current) {
        const inputField = otpGroupRef.current.querySelector('input');
        inputField?.focus();
      }
      // 必ず先頭input要素にrefで直接focus
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 30);
    return () => clearTimeout(timer);
  }, []);

  // 入力時のフォーカス制御＋バリデーション
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
          // 失敗時は必ず1文字目に戻す
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 500);
      }
    }
  }, [expectedPasscode, onAuthenticated]);

  // 個々のslotへrefをセット、Enterなどで最後以外なら次inputへ
  const handleInput = (e: React.FormEvent<HTMLInputElement>, idx: number) => {
    const input = e.target as HTMLInputElement;
    if (input.value && idx < 5) {
      // 1文字入力したら自動的に次のinputをfocus
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
              // input要素にイベントを渡すためにrender prop活用
              render={({ slots }) => (
                <InputOTPGroup ref={otpGroupRef} className="gap-2">
                  {[0,1,2,3,4,5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-12 h-12 text-white border-white/30 bg-white/10 backdrop-blur-xl"
                      ref={el => inputRefs.current[index] = el as HTMLInputElement}
                      // 入力時
                      inputProps={{
                        type: 'tel',
                        pattern: '[0-9]*',
                        inputMode: 'numeric',
                        onInput: (e: React.FormEvent<HTMLInputElement>) => handleInput(e, index),
                        tabIndex: 0, // tab周りも正常化
                        maxLength: 1,
                        autoFocus: index === 0 // 1個目だけautoFocus
                      }}
                    />
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

