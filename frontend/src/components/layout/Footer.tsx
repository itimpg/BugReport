export function Footer() {
  return (
    <footer className="h-10 bg-white border-t flex items-center justify-center px-6 shrink-0">
      <p className="text-xs text-gray-400">
        © {new Date().getFullYear()} BugReport · All rights reserved
      </p>
    </footer>
  );
}
