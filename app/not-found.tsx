import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      data-not-found-page
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050810] px-6 py-16 text-white"
    >
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:60px_60px]" />

      <div className="pointer-events-none fixed left-1/2 top-1/2 h-150 w-150 animate-not-found-glow rounded-full bg-[radial-gradient(circle,rgba(30,58,120,0.25)_0%,transparent_70%)]" />

      <section className="relative z-10 p-8 text-center">
        <div className="relative mb-4 flex animate-not-found-404 items-center justify-center">
          <span className="absolute select-none text-[clamp(140px,22vw,260px)] font-black leading-none tracking-[-0.02em] text-transparent blur-[0.5px] [-webkit-text-stroke:1px_rgba(255,255,255,0.06)]">
            404
          </span>

          <span className="relative bg-[linear-gradient(135deg,#1e3a8a_0%,#1d4ed8_40%,#3b82f6_70%,#93c5fd_100%)] bg-clip-text text-[clamp(120px,20vw,220px)] font-black leading-none tracking-[-0.02em] text-transparent [filter:drop-shadow(0_0_40px_rgba(59,130,246,0.4))]">
            404
          </span>
        </div>

        <h1 className="mb-3 animate-not-found-title text-[clamp(1.4rem,3vw,2rem)] font-bold tracking-normal text-white/95">
          페이지를 찾을 수 없습니다.
        </h1>

        <p className="mx-auto mb-10 max-w-90 animate-not-found-sub text-[clamp(0.85rem,1.5vw,1rem)] font-light leading-7 tracking-normal text-white/40">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
          <br />
          홈페이지로 돌아가서 다시 시도해 주세요.
        </p>

        <Link
          href="/"
          className="group relative inline-flex animate-not-found-button items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#1e3a8a,#1d4ed8)] px-11 py-3.5 text-sm font-semibold tracking-normal text-white shadow-[0_0_30px_rgba(29,78,216,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(59,130,246,0.5)]"
        >
          <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#1d4ed8,#3b82f6)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="relative z-10">← 홈으로 돌아가기</span>
        </Link>
      </section>
    </main>
  );
}
