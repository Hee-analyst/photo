
import React, { useState, useRef } from 'react';
import { Icons } from './constants';
import { transformImageToResumePhoto } from './geminiService';
import { ProcessingResult } from './types';

const App: React.FC = () => {
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setResult({
        originalUrl: base64,
        isProcessing: false
      });
    };
    reader.readAsDataURL(file);
  };

  const handleTransform = async () => {
    if (!result?.originalUrl) return;

    setLoading(true);
    setResult(prev => prev ? { ...prev, isProcessing: true, error: undefined } : null);

    try {
      const processedImageUrl = await transformImageToResumePhoto(result.originalUrl);
      setResult(prev => prev ? { 
        ...prev, 
        resultUrl: processedImageUrl, 
        isProcessing: false 
      } : null);
    } catch (err: any) {
      setResult(prev => prev ? { 
        ...prev, 
        isProcessing: false, 
        error: err.message || "처리 중 오류가 발생했습니다." 
      } : null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    if (!result?.resultUrl) return;
    const link = document.createElement('a');
    link.href = result.resultUrl;
    link.download = 'resume_photo_ai.png';
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 max-w-4xl mx-auto">
      {/* Header */}
      <header className="w-full text-center py-10">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
          AI 취업 사진 메이커
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          일상 사진을 전문 스튜디오에서 촬영한 이력서 사진으로 변환해보세요.
        </p>
      </header>

      <main className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        {!result ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
               onClick={() => fileInputRef.current?.click()}>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
              <Icons.Upload />
            </div>
            <h3 className="text-xl font-semibold text-slate-700">이곳을 클릭하여 사진 업로드</h3>
            <p className="text-slate-400 mt-2 text-sm">얼굴이 잘 보이는 정면 사진이 가장 좋습니다.</p>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Original Preview */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Original Photo</span>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={result.originalUrl} alt="Original" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Result Preview */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">AI Studio Photo</span>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative">
                  {result.isProcessing ? (
                    <div className="flex flex-col items-center animate-pulse">
                      <Icons.Spinner />
                      <p className="text-slate-500 text-sm mt-4 font-medium">스튜디오 보정 중...</p>
                    </div>
                  ) : result.resultUrl ? (
                    <img src={result.resultUrl} alt="Result" className="w-full h-full object-cover" />
                  ) : (
                    <p className="text-slate-400 text-sm text-center px-4">변환 버튼을 누르면 전문 사진으로 바뀝니다.</p>
                  )}
                  
                  {result.error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/90 p-6 text-center">
                      <p className="text-red-600 font-semibold mb-2">오류 발생</p>
                      <p className="text-red-500 text-xs">{result.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              {!result.resultUrl ? (
                <button
                  onClick={handleTransform}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 transition-all transform active:scale-[0.98]"
                >
                  {loading ? '전문 보정 진행 중...' : '스튜디오 사진으로 변환하기'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                  >
                    <Icons.Download />
                    사진 다운로드
                  </button>
                  <button
                    onClick={handleReset}
                    className="sm:w-32 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 rounded-xl transition-all"
                  >
                    다시 시도
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Guide/Info */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {[
          { title: "비즈니스 정장", desc: "AI가 당신의 옷을 깔끔한 정장으로 갈아입혀 드립니다." },
          { title: "스튜디오 조명", desc: "화사하고 균형 잡힌 전문 조명 효과를 적용합니다." },
          { title: "깔끔한 배경", desc: "이력서에 적합한 깔끔한 무채색 배경으로 변경됩니다." }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
            <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      <footer className="mt-20 py-10 text-slate-400 text-sm border-t border-slate-100 w-full text-center">
        &copy; {new Date().getFullYear()} AI Resume Photo Maker. Built with Gemini 2.5.
      </footer>
    </div>
  );
};

export default App;
