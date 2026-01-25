export function TaskTableHeader() {
  return (
    <div className="sticky top-0 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur rounded-t-xl border-b border-gray-100 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center">
        <div className="flex-1 text-xs uppercase text-gray-500 dark:text-gray-400 font-medium tracking-wide">
          Task
        </div>
        <div className="w-32 sm:w-40 text-xs uppercase text-gray-500 dark:text-gray-400 font-medium tracking-wide text-center">
          Created
        </div>
        <div className="w-24 text-xs uppercase text-gray-500 dark:text-gray-400 font-medium tracking-wide text-center">
          Actions
        </div>
      </div>
    </div>
  );
}
