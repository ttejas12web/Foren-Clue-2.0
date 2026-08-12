import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 sm:gap-2.5 shrink-0", className)}>
      <img 
        src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7yfh9aP-3k7exKSgvW9ynV7lb9j62shvwJrpkiEi_9yiWUSxntW5Poc-MOXQCA0fd635VLo8C35glEPFtlSByqxDDepzEAX6D5T4SzFX-8fyKDIoo7_wV3EXH6u-UDF6P344Q4RRlRFY-qfqITWnuSXa7feb89eDlR9SCODoodogdY89rBez2K7fOiQI/s372/4b5616a4-6069-44a7-ba52-88f965165067.png" 
        alt="ForenClue Logo" 
        className="h-8 sm:h-9 w-auto object-contain shrink-0"
      />
      <span className="font-heading font-black text-xl sm:text-2xl tracking-tight text-text-main uppercase whitespace-nowrap">
        Foren<span className="text-warning">Clue</span>
      </span>
    </div>
  );
}


