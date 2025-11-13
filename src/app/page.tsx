import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center mt-10">
      <Link href="/">
        <h1 className="text-3xl font-normal flex flex-col">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>you can&apos;t see, If</span>  
            <Image
              src="/assets/keyboard.png"
              width={30}
              height={30}
              alt="Logo"
            />
          </div>
          <span className="font-bold text-yellow-400">I-showspeed</span>
        </h1>
      </Link>
    </div>
  );
}
